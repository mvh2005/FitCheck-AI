import { createClient } from '@supabase/supabase-js'
import * as SecureStore from 'expo-secure-store'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

/**
 * Use expo-secure-store for auth tokens instead of AsyncStorage.
 * Tokens are encrypted at rest using the device keychain.
 */
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

// ── Database types ────────────────────────────────────────────────────────────

export type Profile = {
  id: string
  display_name: string | null
  gender: string | null
  body_type: string | null
  created_at: string
}

export type ClothingItem = {
  id: string
  user_id: string
  name: string
  category: 'top' | 'bottom' | 'shoes' | 'dress' | 'outerwear' | 'accessory'
  subcategory: string | null
  color: string | null
  secondary_colors: string[] | null
  pattern: string | null
  style: string | null
  formality: number
  season: string[] | null
  image_url: string
  source_url: string | null
  source_type: 'upload' | 'url'
  created_at: string
  updated_at: string
}

export type OutfitRequest = {
  id: string
  user_id: string
  occasion: string
  weather: string | null
  weather_temp: number | null
  style: string | null
  recommendation_count: number
  created_at: string
}

export type Outfit = {
  id: string
  request_id: string
  user_id: string
  title: string | null
  explanation: string | null
  created_at: string
  outfit_items?: OutfitItem[]
}

export type OutfitItem = {
  outfit_id: string
  clothing_item_id: string
  role: string
  clothing_items?: ClothingItem
}

export type Favorite = {
  id: string
  user_id: string
  outfit_id: string
  created_at: string
}
