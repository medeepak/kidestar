import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), { status: 401, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
    }

    const { tier_id } = await req.json();
    if (!tier_id) {
      return new Response(JSON.stringify({ error: "Missing tier_id" }), { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
    }

    // 1. Fetch tier details from database
    const { data: tier, error: tierError } = await supabase
      .from("gem_tiers")
      .select("price_inr, gems")
      .eq("id", tier_id)
      .single();

    if (tierError || !tier) {
      return new Response(JSON.stringify({ error: "Invalid tier_id" }), { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
    }

    const amountPaise = tier.price_inr * 100;
    const rzpKeyId = Deno.env.get("RAZORPAY_KEY_ID");
    const rzpKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!rzpKeyId || !rzpKeySecret) {
      throw new Error("Razorpay credentials not configured");
    }

    // 2. Create Razorpay Order
    const rzpAuth = btoa(`${rzpKeyId}:${rzpKeySecret}`);
    const rzpRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${rzpAuth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amountPaise,
        currency: "INR",
        receipt: `rct_${user.id.split('-')[0]}_${Date.now()}`.substring(0, 40)
      }),
    });

    if (!rzpRes.ok) {
      const errBody = await rzpRes.text();
      console.error("Razorpay order creation failed:", errBody);
      throw new Error(`Razorpay Error: ${errBody}`);
    }

    const rzpOrder = await rzpRes.json();

    // 3. Log purchase in database
    const { error: insertError } = await supabase
      .from("gem_purchases")
      .insert({
        user_id: user.id,
        razorpay_order_id: rzpOrder.id,
        tier_id: tier_id,
        amount_paise: amountPaise,
        gems_awarded: tier.gems,
        status: "created"
      });

    if (insertError) {
      console.error("Failed to insert gem_purchases record:", insertError);
      throw new Error("Failed to initialize order tracking");
    }

    // 4. Return order ID to frontend
    return new Response(JSON.stringify({ id: rzpOrder.id, amount: amountPaise, currency: "INR" }), {
      status: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("create-razorpay-order error:", err);
    return new Response(JSON.stringify({ error: message }), { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
  }
});
