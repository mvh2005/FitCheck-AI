import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('fitcheck_auth_user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const signup = useCallback((displayName, username, password) => {
    const users = JSON.parse(localStorage.getItem('fitcheck_users') || '{}')
    if (users[username.toLowerCase()]) {
      throw new Error('Username already taken 😬')
    }
    const newUser = {
      id: `${username.toLowerCase()}_${Date.now()}`,
      username: username.toLowerCase(),
      displayName,
      createdAt: new Date().toISOString(),
    }
    users[username.toLowerCase()] = { ...newUser, password }
    localStorage.setItem('fitcheck_users', JSON.stringify(users))
    localStorage.setItem('fitcheck_auth_user', JSON.stringify(newUser))
    localStorage.setItem('fitcheck_user_id', newUser.id)
    setUser(newUser)
    return newUser
  }, [])

  const login = useCallback((username, password) => {
    const users = JSON.parse(localStorage.getItem('fitcheck_users') || '{}')
    const found = users[username.toLowerCase()]
    if (!found || found.password !== password) {
      throw new Error('Wrong username or password 👀')
    }
    const { password: _pw, ...userClean } = found
    localStorage.setItem('fitcheck_auth_user', JSON.stringify(userClean))
    localStorage.setItem('fitcheck_user_id', userClean.id)
    setUser(userClean)
    return userClean
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('fitcheck_auth_user')
    setUser(null)
  }, [])

  const updateProfile = useCallback((updates) => {
    setUser(prev => {
      const updated = { ...prev, ...updates }
      localStorage.setItem('fitcheck_auth_user', JSON.stringify(updated))
      // also persist skin tone etc.
      const users = JSON.parse(localStorage.getItem('fitcheck_users') || '{}')
      if (users[updated.username]) {
        const pw = users[updated.username].password
        users[updated.username] = { ...updated, password: pw }
        localStorage.setItem('fitcheck_users', JSON.stringify(users))
      }
      return updated
    })
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
