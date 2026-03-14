import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
};

// Fixed n8n webhook URLs — hardcoded since they never change.
// To add a new rhyme: add its slug → URL here, then redeploy via Supabase MCP or CLI.
const N8N_WEBHOOKS: Record<string, string> = {
  "wheels-on-the-bus":      "https://n8n.srv1159826.hstgr.cloud/webhook/wheels-on-the-bus",
  "johnny-johnny-yes-papa": "https://n8n.srv1159826.hstgr.cloud/webhook/johnny-johnny-yes-papa",
  "baa-baa-black-sheep":    "https://n8n.srv1159826.hstgr.cloud/webhook/baa-baa-black-sheep",
  "twinkle-twinkle":        "https://n8n.srv1159826.hstgr.cloud/webhook/twinkle-twinkle-rhyme",
  "space-odyssey":          "https://n8n.srv1159826.hstgr.cloud/webhook/space-odyssey",
  "walk-with-dinos":        "https://n8n.srv1159826.hstgr.cloud/webhook/walk-with-dinos",
  "monster-madness":        "https://n8n.srv1159826.hstgr.cloud/webhook/monster-madness",
  "dodo-dragon":            "https://n8n.srv1159826.hstgr.cloud/webhook/dodo-dragon",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { rhyme_slug, avatar_url } = body;

    if (!rhyme_slug || !avatar_url) {
      return new Response(JSON.stringify({ error: "Missing rhyme_slug or avatar_url" }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const webhookUrl = N8N_WEBHOOKS[rhyme_slug];
    if (!webhookUrl) {
      return new Response(JSON.stringify({ error: `Unknown rhyme slug: ${rhyme_slug}` }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    console.log(`Triggering n8n for rhyme='${rhyme_slug}', user='${user.id}', webhook='${webhookUrl}'`);

    const payload = {
      user_id: user.id,
      avatar_url: avatar_url,
      rhyme_slug: rhyme_slug,
    };

    // Fire-and-forget — n8n workflows run for up to 20 min.
    // n8n calls rhyme-generation-complete when done, which updates the DB.
    // Sending JSON (not FormData) so n8n can access fields in both main and error workflows.
    EdgeRuntime.waitUntil(
      fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then(async (res) => {
          if (!res.ok) {
            const body = await res.text().catch(() => "(no body)");
            console.error(`n8n webhook returned ${res.status} for '${rhyme_slug}': ${body}`);
          } else {
            console.log(`n8n webhook accepted '${rhyme_slug}' with status ${res.status}`);
          }
        })
        .catch((err) => console.error(`n8n fetch failed for '${rhyme_slug}':`, err))
    );

    return new Response(JSON.stringify({ success: true, user_id: user.id, rhyme_slug }), {
      status: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
