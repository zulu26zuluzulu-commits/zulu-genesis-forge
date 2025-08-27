import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();
    const v0ApiKey = Deno.env.get('V0_DEV_API_KEY');

    if (!v0ApiKey) {
      throw new Error('V0_DEV_API_KEY not configured');
    }

    console.log('Calling v0.dev API with prompt:', prompt);

    const response = await fetch("https://api.v0.dev/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${v0ApiKey}`
      },
      body: JSON.stringify({
        prompt: prompt,
        project: "zulu-ai"
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('v0.dev API error:', response.status, errorText);
      throw new Error(`v0.dev API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('v0.dev API response:', data);

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-with-v0 function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});