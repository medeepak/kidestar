import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info, x-webhook-secret",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  try {
    // Optional webhook secret guard
    const webhookSecret = Deno.env.get("RHYME_WEBHOOK_SECRET");
    if (webhookSecret) {
      const provided = req.headers.get("x-webhook-secret");
      if (provided !== webhookSecret) {
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        });
      }
    }

    const body = await req.json();
    const { user_id, rhyme_slug, video_url, status, gem_cost } = body;

    console.log(`rhyme-generation-complete: user='${user_id}', rhyme='${rhyme_slug}', status='${status}'`);

    if (!user_id || !rhyme_slug) {
      return new Response(JSON.stringify({ error: "Missing user_id or rhyme_slug", received: { user_id, rhyme_slug } }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceKey) {
      console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars");
      return new Response(JSON.stringify({ error: "Server misconfiguration" }), {
        status: 500,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, serviceKey);
    const finalStatus = status === "failed" ? "failed" : "ready";

    // 1. Update the generation record
    const { error: dbError } = await supabase
      .from("generations")
      .update({
        status: finalStatus,
        video_url: finalStatus === "ready" ? video_url : null,
      })
      .eq("user_id", user_id)
      .eq("rhyme_slug", rhyme_slug);

    if (dbError) {
      console.error("DB update error:", JSON.stringify(dbError));
      return new Response(JSON.stringify({ error: dbError.message, code: dbError.code }), {
        status: 500,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    // 2. Gem ledger: deduct on success (gems are NOT charged on initiation, only on delivery)
    const cost = typeof gem_cost === "number" ? gem_cost : 30; // default cost per rhyme

    if (finalStatus === "ready") {
      const { error: gemError } = await supabase.rpc("deduct_gems", {
        p_user_id: user_id,
        p_amount: cost,
      });
      if (gemError) {
        // Log but don't fail — video is already delivered
        console.error(`Gem deduction failed for user=${user_id}: ${gemError.message}`);
      } else {
        console.log(`Deducted ${cost} gems from user=${user_id} for rhyme=${rhyme_slug}`);
      }
    } else {
      // Generation failed — no gems were charged, nothing to refund
      console.log(`Generation failed for user=${user_id}, rhyme=${rhyme_slug}. No gems charged.`);
    }

    return new Response(JSON.stringify({ success: true, status: finalStatus }), {
      status: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : JSON.stringify(err);
    console.error("Unhandled error in rhyme-generation-complete:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
