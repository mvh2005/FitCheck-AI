// supabase/functions/generate-outfits/index.ts
// Deno Edge Function — generates outfit recommendations from a user's wardrobe
// Deploy: supabase functions deploy generate-outfits
// Secret:  supabase secrets set OPENAI_API_KEY=sk-...

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')!
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ── Weather → season mapping ──────────────────────────────────────────────────
const WEATHER_SEASON_MAP: Record<string, string[]> = {
  sunny:  ['spring', 'summer'],
  cloudy: ['spring', 'summer', 'autumn'],
  rainy:  ['spring', 'autumn'],
  cold:   ['autumn', 'winter'],
}

// ── Formality filter per occasion ─────────────────────────────────────────────
const OCCASION_FORMALITY_RANGE: Record<string, [number, number]> = {
  wedding:  [4, 5],
  office:   [3, 5],
  formal:   [4, 5],
  date:     [3, 5],
  casual:   [1, 3],
  party:    [2, 5],
  festival: [1, 3],
  gym:      [1, 2],
  beach:    [1, 2],
}

// ── Hard filter: remove weather/occasion-inappropriate items ──────────────────
function filterWardrobe(
  items: Record<string, unknown>[],
  weather: string,
  occasion: string
): Record<string, unknown>[] {
  const allowedSeasons = WEATHER_SEASON_MAP[weather] ?? []
  const [minFormality, maxFormality] = OCCASION_FORMALITY_RANGE[occasion] ?? [1, 5]

  return items.filter((item) => {
    const season = item.season as string[] | null

    // If season is set, ensure at least one allowed season matches
    if (season && season.length > 0) {
      const seasonMatch = season.some((s) => allowedSeasons.includes(s))
      if (!seasonMatch) return false
    }

    // Formality check
    const formality = Number(item.formality ?? 3)
    if (formality < minFormality || formality > maxFormality) return false

    return true
  })
}

// ── Build AI prompt ───────────────────────────────────────────────────────────
function buildPrompt(
  occasion: string,
  weather: string,
  weatherTemp: number | null,
  style: string,
  count: number,
  items: Record<string, unknown>[]
): string {
  const itemList = items.map((item) => {
    return [
      `ID: ${item.id}`,
      `Category: ${item.category}`,
      `Name: ${item.name}`,
      `Color: ${item.color ?? 'unknown'}`,
      `Pattern: ${item.pattern ?? 'solid'}`,
      `Style: ${item.style ?? 'casual'}`,
      `Formality: ${item.formality ?? 3}/5`,
      `Season: ${(item.season as string[] | null)?.join(', ') ?? 'all'}`,
      item.image_url ? `Image: ${item.image_url}` : null,
    ].filter(Boolean).join('\n')
  }).join('\n\n---\n\n')

  return `You are an expert fashion stylist. Create ${count} complete, stylish outfits from the user's actual wardrobe.

USER REQUIREMENTS
- Occasion: ${occasion}
- Weather: ${weatherTemp !== null ? `${weatherTemp}°C, ` : ''}${weather}
- Preferred style: ${style}
- Number of outfits requested: ${count}

USER'S WARDROBE (${items.length} items after filtering)
${itemList}

RULES
1. Use ONLY items from the wardrobe above (reference exact IDs).
2. Each outfit must include at least: one top (or dress), one bottom (or dress covers this), one shoes.
3. Create ${count} DISTINCT outfits — do not repeat the same combination.
4. Consider color harmony, style compatibility, occasion appropriateness, and weather.
5. Outerwear and accessories are optional — include them only when they improve the outfit.

Return ONLY valid JSON (no markdown, no code fences):
{
  "outfits": [
    {
      "title": "Creative, concise outfit name",
      "items": [
        { "clothing_id": "<exact id from wardrobe>", "role": "top" },
        { "clothing_id": "<exact id from wardrobe>", "role": "bottom" },
        { "clothing_id": "<exact id from wardrobe>", "role": "shoes" }
      ],
      "reason": "2-3 sentences explaining why this outfit works for the occasion and weather"
    }
  ]
}`
}

serve(async (req) => {
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

    // ── 2. Parse + validate request ─────────────────────────────────────────
    const body = await req.json()
    const {
      occasion     = 'casual',
      weather      = 'sunny',
      weather_temp = null,
      style        = 'casual',
      count        = 3,
    } = body

    const safeCount = Math.min(5, Math.max(1, Number(count)))

    // ── 3. Fetch user's wardrobe ────────────────────────────────────────────
    const { data: wardrobeItems, error: wardrobeError } = await supabase
      .from('clothing_items')
      .select('*')
      .eq('user_id', user.id)

    if (wardrobeError) {
      return new Response(JSON.stringify({ error: 'Failed to fetch wardrobe', detail: wardrobeError.message }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!wardrobeItems || wardrobeItems.length < 2) {
      return new Response(JSON.stringify({ outfits: [], message: 'Not enough wardrobe items. Add at least a top and bottom.' }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ── 4. Stage 1: Hard filter ─────────────────────────────────────────────
    const filtered = filterWardrobe(wardrobeItems, weather, occasion)

    if (filtered.length < 2) {
      // Fallback: use all items if filter leaves too few
      console.warn('Hard filter too strict, falling back to all items')
    }

    const itemsToUse = filtered.length >= 2 ? filtered : wardrobeItems

    // ── 5. Save outfit request to DB ────────────────────────────────────────
    const { data: requestRecord, error: requestError } = await supabase
      .from('outfit_requests')
      .insert({
        user_id: user.id,
        occasion,
        weather,
        weather_temp: weather_temp ?? null,
        style,
        recommendation_count: safeCount,
      })
      .select()
      .single()

    if (requestError) console.error('Failed to save request:', requestError)

    // ── 6. Stage 2: Call OpenAI ─────────────────────────────────────────────
    const prompt = buildPrompt(occasion, weather, weather_temp, style, safeCount, itemsToUse)

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 2000,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'user', content: prompt },
        ],
      }),
    })

    if (!openAIResponse.ok) {
      const errText = await openAIResponse.text()
      console.error('OpenAI error:', errText)
      return new Response(JSON.stringify({ error: 'AI generation failed' }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const openAIData = await openAIResponse.json()
    const rawContent = openAIData.choices?.[0]?.message?.content

    let aiResult: { outfits: Array<{ title: string; items: Array<{ clothing_id: string; role: string }>; reason: string }> }
    try {
      aiResult = JSON.parse(rawContent)
    } catch {
      return new Response(JSON.stringify({ error: 'AI returned invalid JSON' }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Build a lookup map for quick item resolution
    const itemMap = new Map(wardrobeItems.map((i: Record<string, unknown>) => [i.id, i]))

    // ── 7. Stage 3: Save outfits + outfit_items to DB ───────────────────────
    const savedOutfits = []

    for (const generatedOutfit of aiResult.outfits ?? []) {
      // Validate all clothing IDs exist in the user's wardrobe
      const validItems = (generatedOutfit.items ?? []).filter(
        (item) => item.clothing_id && itemMap.has(item.clothing_id)
      )

      if (validItems.length === 0) continue

      // Insert outfit record
      const { data: outfitRecord, error: outfitError } = await supabase
        .from('outfits')
        .insert({
          request_id:  requestRecord?.id ?? null,
          user_id:     user.id,
          title:       generatedOutfit.title ?? 'Outfit',
          explanation: generatedOutfit.reason ?? '',
        })
        .select()
        .single()

      if (outfitError || !outfitRecord) {
        console.error('Failed to insert outfit:', outfitError)
        continue
      }

      // Insert outfit_items
      const outfitItemInserts = validItems.map((item) => ({
        outfit_id:        outfitRecord.id,
        clothing_item_id: item.clothing_id,
        role:             item.role ?? 'unknown',
      }))

      await supabase.from('outfit_items').insert(outfitItemInserts)

      // Fetch full outfit with related items for response
      const { data: fullOutfit } = await supabase
        .from('outfits')
        .select(`
          *,
          outfit_items (
            *,
            clothing_items (*)
          )
        `)
        .eq('id', outfitRecord.id)
        .single()

      if (fullOutfit) savedOutfits.push(fullOutfit)
    }

    // ── 8. Return response ──────────────────────────────────────────────────
    return new Response(
      JSON.stringify({
        outfits: savedOutfits,
        total: savedOutfits.length,
        filtered_wardrobe_size: itemsToUse.length,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    console.error('Unhandled error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
