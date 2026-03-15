import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
};

// Simple HMAC-SHA256 signature verification using Web Crypto API
async function verifySignature(orderId: string, paymentId: string, signature: string, secret: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const data = encoder.encode(`${orderId}|${paymentId}`);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );

  // Convert hex signature from Razorpay to Uint8Array buffer
  const sigBuffer = new Uint8Array(signature.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
  return await crypto.subtle.verify("HMAC", cryptoKey, sigBuffer, data);
}

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

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return new Response(JSON.stringify({ error: "Missing payment details" }), { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
    }

    const rzpKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!rzpKeySecret) {
      throw new Error("Razorpay credentials not configured");
    }

    // 1. Verify Razorpay Signature
    const isValid = await verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature, rzpKeySecret);
    
    if (!isValid) {
      console.error("Invalid signature for order:", razorpay_order_id);
      return new Response(JSON.stringify({ error: "Invalid payment signature" }), { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
    }

    // 2. Call RPC to safely update DB and award gems
    const { data, error } = await supabase.rpc("award_gems_for_purchase", {
      p_order_id: razorpay_order_id,
      p_payment_id: razorpay_payment_id
    });

    if (error) {
      console.error("RPC award_gems_for_purchase failed:", error);
      throw new Error(error.message);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("verify-razorpay-payment error:", err);
    return new Response(JSON.stringify({ error: message }), { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
  }
});
