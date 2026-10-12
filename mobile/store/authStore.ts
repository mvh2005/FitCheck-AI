import { create } from 'zustand'
import { Session, User } from '@supabase/supabase-js'
import { supabase, Profile } from '../lib/supabase'

type AuthState = {
  session: Session | null
  user: User | null
  profile: Profile | null
  loading: boolean

  setSession: (session: Session | null) => void
  setLoading: (loading: boolean) => void
  fetchProfile: () => Promise<void>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  loading: true,

  setSession: (session) => {
    set({ session, user: session?.user ?? null })
    if (session?.user) get().fetchProfile()
  },

  setLoading: (loading) => set({ loading }),

  fetchProfile: async () => {
    const userId = get().user?.id
    if (!userId) return

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (data) set({ profile: data })
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ session: null, user: null, profile: null })
  },
}))
