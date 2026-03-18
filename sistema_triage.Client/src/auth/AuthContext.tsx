import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { TokenResponse, Rol } from '../types'
import { authApi } from '../api/auth'

interface AuthState {
  user: TokenResponse | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  hasRole: (rol: Rol) => boolean
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<TokenResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as TokenResponse
        const exp = new Date(parsed.expiracion)
        if (exp > new Date()) {
          setUser(parsed)
        } else {
          localStorage.clear()
        }
      } catch {
        localStorage.clear()
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const data = await authApi.login({ email, password })
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    localStorage.setItem('user', JSON.stringify(data))
    setUser(data)
  }

  const logout = async () => {
    try { await authApi.logout() } catch { /* ignorar */ }
    localStorage.clear()
    setUser(null)
  }

  const hasRole = (rol: Rol) => user?.roles.includes(rol) ?? false

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      hasRole
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}