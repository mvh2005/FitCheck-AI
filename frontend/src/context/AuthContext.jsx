/**
 * AuthContext.jsx — Provides Firebase auth state to the entire app.
 *
 * Wraps children with a context that exposes:
 *   - user: the current Firebase user (or null)
 *   - loading: true while auth state is being resolved
 *   - signIn: triggers Google sign-in popup
 *   - logOut: signs the user out
 */

import { createContext, useContext, useState, useEffect } from 'react'
import { auth, signInWithGoogle, signOut, onAuthStateChanged } from '../lib/firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const signIn = async () => {
    try {
      await signInWithGoogle()
    } catch (err) {
      console.error('Google sign-in failed:', err)
      throw err
    }
  }

  const logOut = async () => {
    await signOut(auth)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, logOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}
