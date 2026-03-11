import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info, x-webhook-secret",
};

/**
 * rhyme-generation-complete
 *
 * Called by n8n at two points and from the error workflow:
 *
 * 1. Early in main workflow — marks processing, stores execution ID:
 *    { user_id, rhyme_slug, n8n_execution_id, status: "processing" }
 *
 * 2. On success — marks ready, deducts gems:
 *    { user_id, rhyme_slug, video_url, n8n_execution_id?, status: "ready", gem_cost? }
 *
 * 3. From error workflow — looks up by execution ID, marks failed (no gem charge):
 *    { n8n_execution_id, status: "failed" }
 */
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  try {
    const webhookSecret = Deno.env.get("RHYME_WEBHOOK_SECRET");
    if (webhookSecret) {
      const provided = req.headers.get("x-webhook-secret");
      if (provided !== webhookSecret) {
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403, headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        });
      }
    }

    const body = await req.json();
    const { user_id, rhyme_slug, video_url, status, gem_cost, n8n_execution_id } = body;

    console.log(`rhyme-generation-complete: user='${user_id}', rhyme='${rhyme_slug}', status='${status}', exec_id='${n8n_execution_id}'`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceKey) {
      return new Response(JSON.stringify({ error: "Server misconfiguration" }), {
        status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    // ── CASE 1: PROCESSING ── store execution ID ──────────────────────────────
    if (status === "processing") {
      if (!user_id || !rhyme_slug) {
        return new Response(JSON.stringify({ error: "Missing user_id or rhyme_slug" }), {
          status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        });
      }
      const { error } = await supabase
        .from("generations")
        .update({ status: "processing", n8n_execution_id: n8n_execution_id ?? null })
        .eq("user_id", user_id)
        .eq("rhyme_slug", rhyme_slug);

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        });
      }
      console.log(`Marked processing for user='${user_id}' rhyme='${rhyme_slug}', exec_id='${n8n_execution_id}'`);
      return new Response(JSON.stringify({ success: true, status: "processing" }), {
        status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    // ── CASE 2: FAILED via error workflow ── look up by n8n_execution_id ─────
    if (status === "failed" && !user_id && n8n_execution_id) {
      const { data: genRecord, error: lookupError } = await supabase
        .from("generations")
        .select("id, user_id, rhyme_slug")
        .eq("n8n_execution_id", n8n_execution_id)
        .maybeSingle();

      if (lookupError || !genRecord) {
        console.error(`No generation found for exec_id='${n8n_execution_id}'`);
        return new Response(JSON.stringify({ error: "Generation record not found", n8n_execution_id }), {
          status: 404, headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        });
      }

      await supabase.from("generations").update({ status: "failed", video_url: null }).eq("id", genRecord.id);

      // No gems charged (gems only deducted on success) — nothing to refund.
      console.log(`Marked FAILED via exec_id='${n8n_execution_id}' → user='${genRecord.user_id}', rhyme='${genRecord.rhyme_slug}'`);
      return new Response(JSON.stringify({ success: true, status: "failed", resolved: { user_id: genRecord.user_id, rhyme_slug: genRecord.rhyme_slug } }), {
        status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    // ── CASE 3: READY or FAILED with user_id + rhyme_slug ────────────────────
    if (!user_id || !rhyme_slug) {
      return new Response(JSON.stringify({ error: "Provide user_id+rhyme_slug, or n8n_execution_id for error-workflow failures." }), {
        status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const finalStatus = status === "failed" ? "failed" : "ready";

    const { error: dbError } = await supabase
      .from("generations")
      .update({
        status: finalStatus,
        video_url: finalStatus === "ready" ? video_url : null,
        ...(n8n_execution_id ? { n8n_execution_id } : {}),
      })
      .eq("user_id", user_id)
      .eq("rhyme_slug", rhyme_slug);

    if (dbError) {
      return new Response(JSON.stringify({ error: dbError.message }), {
        status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    if (finalStatus === "ready") {
      const cost = typeof gem_cost === "number" ? gem_cost : 30;
      const { error: gemError } = await supabase.rpc("deduct_gems", { p_user_id: user_id, p_amount: cost });
      if (gemError) console.error(`Gem deduction failed for user=${user_id}: ${gemError.message}`);
      else console.log(`Deducted ${cost} gems from user=${user_id}`);

      const { count } = await supabase.from("generations").select("id", { count: "exact", head: true }).eq("user_id", user_id).eq("status", "ready");
      if (count === 1) {
        const { error: refErr } = await supabase.rpc("award_referral_gems", { p_user_id: user_id });
        if (refErr) console.error(`Referral bonus failed: ${refErr.message}`);
        else console.log(`Referral bonus awarded for user=${user_id}'s first video`);
      }

      // ── OneSignal Push Notification ───────────────────────────────────────
      const { data: profile } = await supabase.from('profiles').select('onesignal_id').eq('id', user_id).single();
      if (profile?.onesignal_id) {
        const onesignalAppId = Deno.env.get('ONESIGNAL_APP_ID');
        const onesignalApiKey = Deno.env.get('ONESIGNAL_REST_API_KEY');
        const siteUrl = Deno.env.get('SITE_URL') || 'http://localhost:3000';

        if (onesignalAppId && onesignalApiKey) {
           try {
             const pushReq = await fetch('https://api.onesignal.com/notifications', {
               method: 'POST',
               headers: {
                 'Content-Type': 'application/json',
                 'Authorization': `Basic ${onesignalApiKey}`,
               },
               body: JSON.stringify({
                 app_id: onesignalAppId,
                 include_subscription_ids: [profile.onesignal_id],
                 headings: { en: "✨ Your Star is Ready!" },
                 contents: { en: `The video for ${rhyme_slug} has finished generating.` },
                 url: `${siteUrl}/rhymes/${rhyme_slug}`
               })
             });
             const pushRes = await pushReq.json();
             console.log(`Push notification sent to ${profile.onesignal_id}:`, pushRes);
           } catch (pushErr) {
             console.error('Failed to send push notification:', pushErr);
           }
        } else {
           console.log('Skipping push notification—OneSignal keys not configured in Edge Function env');
        }
      }

    } else {
      console.log(`Generation failed for user=${user_id}. No gems charged.`);
    }

    return new Response(JSON.stringify({ success: true, status: finalStatus }), {
      status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : JSON.stringify(err);
    console.error("Unhandled error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
