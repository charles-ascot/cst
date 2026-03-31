import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const AuthContext = createContext(null)

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => sessionStorage.getItem('chimera_token'))
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(!!sessionStorage.getItem('chimera_token'))

  // Verify token on mount if one exists in session
  useEffect(() => {
    if (!token) { setLoading(false); return }
    fetch(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => { setUser(data); setLoading(false) })
      .catch(() => { logout(); setLoading(false) })
  }, [])

  const login = useCallback(async (email, password) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || 'Invalid credentials')
    }
    const data = await res.json()
    setToken(data.access_token)
    setUser(data.user)
    sessionStorage.setItem('chimera_token', data.access_token)
    return data
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    sessionStorage.removeItem('chimera_token')
  }, [])

  return (
    <AuthContext.Provider value={{ token, user, login, logout, loading, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
