import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'
import '../lib/firebase.js'

const AuthContext = createContext(null)

const auth = getAuth()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('fitcheck_auth_user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const loginWithGoogle = useCallback(async () => {
    const provider = new GoogleAuthProvider()
    const result = await signInWithPopup(auth, provider)
    const firebaseUser = result.user
    const u = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
      photoURL: firebaseUser.photoURL,
      username: firebaseUser.email.split('@')[0],
    }
    setUser(u)
    localStorage.setItem('fitcheck_auth_user', JSON.stringify(u))
    localStorage.setItem('fitcheck_user_id', firebaseUser.uid.toLowerCase())
    return u
  }, [])

  const logout = useCallback(async () => {
    await signOut(auth)
    setUser(null)
    localStorage.removeItem('fitcheck_auth_user')
    localStorage.removeItem('fitcheck_user_id')
    localStorage.removeItem('fitcheck_skin_tone')
    localStorage.removeItem('fitcheck_gender')
    localStorage.removeItem('fitcheck_body_type')
  }, [])

  const updateProfile = useCallback((updates) => {
    setUser(prev => {
      if (!prev) return null
      const updated = { ...prev, ...updates }
      localStorage.setItem('fitcheck_auth_user', JSON.stringify(updated))
      return updated
    })
  }, [])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const u = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          photoURL: firebaseUser.photoURL,
          username: firebaseUser.email.split('@')[0],
        }
        setUser(u)
        localStorage.setItem('fitcheck_auth_user', JSON.stringify(u))
        localStorage.setItem('fitcheck_user_id', firebaseUser.uid.toLowerCase())
      } else {
        setUser(null)
        localStorage.removeItem('fitcheck_auth_user')
        localStorage.removeItem('fitcheck_user_id')
      }
    })
    return unsubscribe
  }, [])

  return (
    <AuthContext.Provider value={{ user, loginWithGoogle, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

