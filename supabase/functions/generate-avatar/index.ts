// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  let step = 'init';
  try {
    const { childName, photoBase64 } = await req.json()
    
    // Check OpenAI API key
    step = 'get_openai_key';
    const openAiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAiKey) {
      throw new Error('OPENAI_API_KEY is not set in edge function environment')
    }

    // 1. Convert base64 photo to binary Blob for the edits endpoint
    step = 'decode_input_image';
    const base64Data = photoBase64.replace(/^data:image\/\w+;base64,/, '');
    const binaryStr = atob(base64Data);
    const inputBytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      inputBytes[i] = binaryStr.charCodeAt(i);
    }
    const inputBlob = new Blob([inputBytes], { type: 'image/png' });

    // 2. Use the images/edits endpoint which accepts both image + text prompt
    step = 'dalle_api';
    const formData = new FormData();
    formData.append('model', 'gpt-image-1.5');
    formData.append('image', inputBlob, 'photo.png');
    formData.append('prompt', `Create a high-quality 3D animated toddler avatar of a young child named ${childName}, bearing extreme likeness to their uploaded photo.

Style requirements:
- Bright, colorful preschool animation style
- Soft rounded facial features, but maintain the exact eye shape, nose shape, and mouth shape from the photo.
- Large expressive eyes, matching the exact color in the photo.
- Smooth glossy skin with soft shading, matching the exact skin tone from the photo.
- Keep the character's exact hairstyle, color, and texture as seen in the photo.
- Slightly oversized head-to-body ratio (cute proportions)
- Toy-like, friendly appearance
- Clean studio lighting
- Soft pastel background

Rendering style:
- Pixar-inspired lighting
- Soft global illumination
- High detail 3D render

Expression:
- Happy, joyful, slightly open smile
- Eyes sparkling and lively
- Energetic preschool vibe

Avoid:
- Hyper-realism
- Flat 2D cartoon
- Deviating from the physical traits in the uploaded photo`);
    formData.append('size', '1024x1024');
    formData.append('n', '1');

    const generateRes = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiKey}`,
      },
      body: formData,
    })

    if (!generateRes.ok) {
      const errText = await generateRes.text();
      throw new Error(`OpenAI DALL-E Error: ${errText}`);
    }

    step = 'dalle_parse';
    const generateData = await generateRes.json()

    if (!generateData || !generateData.data || !generateData.data[0]) {
        throw new Error(`OpenAI did not return an image URL. Response: ${JSON.stringify(generateData)}`);
    }

    const b64Data = generateData.data[0].b64_json
    const dallEUrl = generateData.data[0].url

    let imageBlob: Blob;

    if (b64Data) {
      step = 'decode_b64';
      const binaryStr = atob(b64Data);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      imageBlob = new Blob([bytes], { type: 'image/png' });
    } else if (dallEUrl) {
      step = 'download_dalle_image';
      const imageRes = await fetch(dallEUrl)
      imageBlob = await imageRes.blob()
    } else {
      throw new Error(`No image payload (b64_json or url). Response: ${JSON.stringify(generateData)}`);
    }

    step = 'init_supabase';
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    const safeName = (childName || 'avatar').replace(/\W/g, '')
    const fileName = `${safeName}-${Date.now()}.png`
    
    step = 'upload_storage';
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, imageBlob, {
        contentType: 'image/png',
        upsert: true
      })

    if (uploadError) {
      throw new Error(`Storage upload error: ${JSON.stringify(uploadError)}`)
    }

    const { data: publicUrlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)

    return new Response(JSON.stringify({ success: true, imageUrl: publicUrlData.publicUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error: any) {
    console.error('Error generating avatar:', error)
    return new Response(JSON.stringify({ success: false, error: `${step} failed: ` + error.message, stack: error.stack }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/generate-avatar' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
