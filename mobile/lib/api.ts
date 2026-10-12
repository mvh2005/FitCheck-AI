import { supabase, ClothingItem, Outfit } from './supabase'

// ── Image upload ──────────────────────────────────────────────────────────────

/**
 * Upload a clothing image to Supabase Storage.
 * Returns the public URL of the uploaded image.
 */
export async function uploadClothingImage(
  userId: string,
  imageUri: string,
  fileName?: string
): Promise<string> {
  const ext = imageUri.split('.').pop() ?? 'jpg'
  const name = fileName ?? `${Date.now()}.${ext}`
  const path = `${userId}/${name}`

  const response = await fetch(imageUri)
  const blob = await response.blob()
  const arrayBuffer = await blob.arrayBuffer()

  const { error } = await supabase.storage
    .from('wardrobe')
    .upload(path, arrayBuffer, {
      contentType: `image/${ext}`,
      upsert: false,
    })

  if (error) throw error

  const { data } = supabase.storage.from('wardrobe').getPublicUrl(path)
  return data.publicUrl
}

// ── Clothing analysis (Edge Function) ─────────────────────────────────────────

export type ClothingAnalysis = {
  name: string
  category: ClothingItem['category']
  subcategory: string
  color: string
  secondary_colors: string[]
  pattern: string
  style: string
  formality: number
  season: string[]
}

/**
 * Send an image URL to the analyze-clothing Edge Function.
 * OpenAI Vision classifies the item and returns structured metadata.
 */
export async function analyzeClothing(imageUrl: string): Promise<ClothingAnalysis> {
  const { data, error } = await supabase.functions.invoke('analyze-clothing', {
    body: { image_url: imageUrl },
  })
  if (error) throw error
  return data as ClothingAnalysis
}

// ── Outfit generation (Edge Function) ─────────────────────────────────────────

export type GenerateOutfitsParams = {
  occasion: string
  weather: string
  weatherTemp: number | null
  style: string
  count: number
}

export type GeneratedOutfit = {
  title: string
  items: Array<{ clothing_id: string; role: string }>
  reason: string
}

/**
 * Call generate-outfits Edge Function.
 * Returns outfit suggestions saved to DB, with item details populated.
 */
export async function generateOutfits(
  params: GenerateOutfitsParams
): Promise<Outfit[]> {
  const { data, error } = await supabase.functions.invoke('generate-outfits', {
    body: {
      occasion: params.occasion,
      weather: params.weather,
      weather_temp: params.weatherTemp,
      style: params.style,
      count: Math.min(5, Math.max(1, params.count)),
    },
  })
  if (error) throw error
  return data.outfits as Outfit[]
}

// ── Wardrobe CRUD ─────────────────────────────────────────────────────────────

export async function getWardrobe(userId: string): Promise<ClothingItem[]> {
  const { data, error } = await supabase
    .from('clothing_items')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function addClothingItem(
  item: Omit<ClothingItem, 'id' | 'created_at' | 'updated_at'>
): Promise<ClothingItem> {
  const { data, error } = await supabase
    .from('clothing_items')
    .insert(item)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteClothingItem(itemId: string): Promise<void> {
  const { error } = await supabase
    .from('clothing_items')
    .delete()
    .eq('id', itemId)

  if (error) throw error
}

// ── Outfits ───────────────────────────────────────────────────────────────────

export async function getOutfitById(outfitId: string): Promise<Outfit | null> {
  const { data, error } = await supabase
    .from('outfits')
    .select(`
      *,
      outfit_items (
        *,
        clothing_items (*)
      )
    `)
    .eq('id', outfitId)
    .single()

  if (error) return null
  return data
}

export async function getSavedOutfits(userId: string): Promise<Outfit[]> {
  const { data, error } = await supabase
    .from('favorites')
    .select(`
      outfit_id,
      outfits (
        *,
        outfit_items (
          *,
          clothing_items (*)
        )
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) return []
  return (data ?? []).map((f: any) => f.outfits).filter(Boolean) as Outfit[]
}

// ── Favorites ─────────────────────────────────────────────────────────────────

export async function toggleFavorite(
  userId: string,
  outfitId: string,
  currentlyFavorited: boolean
): Promise<void> {
  if (currentlyFavorited) {
    await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('outfit_id', outfitId)
  } else {
    await supabase
      .from('favorites')
      .insert({ user_id: userId, outfit_id: outfitId })
  }
}

export async function isFavorited(
  userId: string,
  outfitId: string
): Promise<boolean> {
  const { data } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('outfit_id', outfitId)
    .maybeSingle()
  return !!data
}

// ── Profile ───────────────────────────────────────────────────────────────────

export async function upsertProfile(profile: {
  id: string
  display_name?: string
  gender?: string
  body_type?: string
}): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .upsert(profile, { onConflict: 'id' })
  if (error) throw error
}
