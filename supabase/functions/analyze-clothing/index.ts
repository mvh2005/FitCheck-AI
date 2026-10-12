// supabase/functions/analyze-clothing/index.ts
// Deno Edge Function — analyzes a clothing image using OpenAI Vision
// Deploy: supabase functions deploy analyze-clothing
// Secret:  supabase secrets set OPENAI_API_KEY=sk-...

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')!
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SYSTEM_PROMPT = `You are a professional fashion analyst AI.
Analyze the clothing item in the image and return ONLY valid JSON (no markdown, no code fences).
Be accurate and specific about the clothing category, color, and style.`

const USER_PROMPT = `Analyze this clothing item and return structured JSON with these exact fields:
{
  "name": "descriptive name (e.g. 'Navy Blue Oxford Shirt')",
  "category": "one of: top | bottom | shoes | dress | outerwear | accessory",
  "subcategory": "specific type (e.g. shirt, jeans, sneakers, blazer)",
  "color": "primary color name (e.g. navy blue, off-white, burgundy)",
  "secondary_colors": ["array", "of", "secondary", "colors"],
  "pattern": "one of: solid | striped | plaid | floral | graphic | checked | abstract | animal print | other",
  "style": "one of: casual | formal | smart-casual | sporty | bohemian | streetwear | minimalist | classic",
  "formality": 1-5 integer (1=very casual, 5=very formal),
  "season": ["array", "of", "applicable", "seasons"] (spring | summer | autumn | winter)
}

Return ONLY the JSON object, nothing else.`

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // ── 1. Authenticate user ────────────────────────────────────────────────
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ── 2. Parse request body ───────────────────────────────────────────────
    const { image_url } = await req.json()

    if (!image_url || typeof image_url !== 'string') {
      return new Response(JSON.stringify({ error: 'image_url is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ── 3. Call OpenAI Vision API ───────────────────────────────────────────
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 500,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: [
              { type: 'text', text: USER_PROMPT },
              { type: 'image_url', image_url: { url: image_url, detail: 'low' } },
            ],
          },
        ],
      }),
    })

    if (!openAIResponse.ok) {
      const errBody = await openAIResponse.text()
      console.error('OpenAI error:', errBody)
      return new Response(JSON.stringify({ error: 'AI analysis failed', detail: errBody }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ── 4. Parse and validate response ──────────────────────────────────────
    const openAIData = await openAIResponse.json()
    const rawContent = openAIData.choices?.[0]?.message?.content

    if (!rawContent) {
      return new Response(JSON.stringify({ error: 'Empty AI response' }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    let analysis: Record<string, unknown>
    try {
      analysis = JSON.parse(rawContent)
    } catch {
      return new Response(JSON.stringify({ error: 'AI returned invalid JSON', raw: rawContent }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ── 5. Validate and sanitize output ─────────────────────────────────────
    const validCategories = ['top', 'bottom', 'shoes', 'dress', 'outerwear', 'accessory']
    const validSeasons = ['spring', 'summer', 'autumn', 'winter']

    const sanitized = {
      name:             String(analysis.name ?? 'Clothing Item'),
      category:         validCategories.includes(String(analysis.category)) ? analysis.category : 'top',
      subcategory:      String(analysis.subcategory ?? ''),
      color:            String(analysis.color ?? ''),
      secondary_colors: Array.isArray(analysis.secondary_colors) ? analysis.secondary_colors.map(String) : [],
      pattern:          String(analysis.pattern ?? 'solid'),
      style:            String(analysis.style ?? 'casual'),
      formality:        Math.min(5, Math.max(1, Number(analysis.formality ?? 3))),
      season:           Array.isArray(analysis.season)
                          ? analysis.season.filter((s: string) => validSeasons.includes(s))
                          : ['spring', 'summer'],
    }

    // ── 6. Return result ─────────────────────────────────────────────────────
    return new Response(JSON.stringify(sanitized), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (err) {
    console.error('Unhandled error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
