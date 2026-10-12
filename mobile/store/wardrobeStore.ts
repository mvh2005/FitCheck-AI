import { create } from 'zustand'
import { ClothingItem } from '../lib/supabase'
import { getWardrobe, deleteClothingItem, addClothingItem } from '../lib/api'

type WardrobeState = {
  items: ClothingItem[]
  loading: boolean
  refreshing: boolean
  activeCategory: string

  fetchWardrobe: (userId: string) => Promise<void>
  refresh: (userId: string) => Promise<void>
  addItem: (item: Omit<ClothingItem, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  setCategory: (category: string) => void
  filteredItems: () => ClothingItem[]
}

export const useWardrobeStore = create<WardrobeState>((set, get) => ({
  items: [],
  loading: false,
  refreshing: false,
  activeCategory: 'all',

  fetchWardrobe: async (userId) => {
    set({ loading: true })
    try {
      const items = await getWardrobe(userId)
      set({ items })
    } catch (e) {
      console.warn('Failed to fetch wardrobe', e)
    } finally {
      set({ loading: false })
    }
  },

  refresh: async (userId) => {
    set({ refreshing: true })
    try {
      const items = await getWardrobe(userId)
      set({ items })
    } finally {
      set({ refreshing: false })
    }
  },

  addItem: async (item) => {
    const newItem = await addClothingItem(item)
    set((state) => ({ items: [newItem, ...state.items] }))
  },

  removeItem: async (itemId) => {
    await deleteClothingItem(itemId)
    set((state) => ({ items: state.items.filter((i) => i.id !== itemId) }))
  },

  setCategory: (category) => set({ activeCategory: category }),

  filteredItems: () => {
    const { items, activeCategory } = get()
    if (activeCategory === 'all') return items
    return items.filter((i) => i.category === activeCategory)
  },
}))
