import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getToken, setToken, clearToken, getTokenPayload } from '../utils/auth.js'
import { API_URL } from '../utils/constants.js'

const AuthContext = createContext(null)

async function parseResponseBody(response) {
  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    return null
  }

  try {
    return await response.json()
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const refreshProfile = useCallback(async () => {
    const token = getToken()
    if (!token) return null

    let response
    try {
      response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
    } catch {
      throw new Error('Unable to reach backend. Please check server connection.')
    }

    if (!response.ok) {
      throw new Error('Failed to fetch profile')
    }

    const data = await parseResponseBody(response)
    if (!data) {
      throw new Error('Failed to fetch profile')
    }
    const hydratedUser = {
      id: data.id,
      email: data.email,
      role: data.role,
      customerId: data.customerId,
      name: data.name,
      mustChangePassword: !!data.mustChangePassword,
      profileCompleted: !!data.profileCompleted,
      photoUrl: data.photoUrl || ''
    }

    setUser(hydratedUser)
    return hydratedUser
  }, [])

  useEffect(() => {
    // Check for existing token on mount
    const token = getToken()
    if (token) {
      const payload = getTokenPayload()
      if (payload && payload.exp * 1000 > Date.now()) {
        setUser({
          id: payload.sub,
          email: payload.email,
          role: payload.role,
          customerId: payload.customerId,
          name: payload.name,
          mustChangePassword: !!payload.mustChangePassword,
          profileCompleted: !!payload.profileCompleted,
          photoUrl: payload.photoUrl || ''
        })
        refreshProfile().catch(() => {})
      } else {
        // Token expired
        clearToken()
      }
    }
    setLoading(false)
  }, [refreshProfile])

  const login = useCallback(async (email, password, role) => {
    let response
    try {
      response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
      })
    } catch {
      throw new Error('Unable to reach backend. Please check server connection.')
    }

    const data = await parseResponseBody(response)
    if (!response.ok) {
      throw new Error(data?.message || `Login failed (${response.status})`)
    }

    setToken(data.token)
    setUser({
      id: data.user.id,
      email: data.user.email,
      role: data.user.role,
      customerId: data.user.customerId,
      name: data.user.name,
      mustChangePassword: !!data.user.mustChangePassword,
      profileCompleted: !!data.user.profileCompleted,
      photoUrl: data.user.photoUrl || ''
    })

    return data.user
  }, [])

  const signup = useCallback(async (userData) => {
    let response
    try {
      response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      })
    } catch {
      throw new Error('Unable to reach backend. Please check server connection.')
    }

    const data = await parseResponseBody(response)
    if (!response.ok) {
      throw new Error(data?.message || `Signup failed (${response.status})`)
    }

    setToken(data.token)
    setUser({
      id: data.user.id,
      email: data.user.email,
      role: data.user.role,
      customerId: data.user.customerId,
      name: data.user.name,
      mustChangePassword: !!data.user.mustChangePassword,
      profileCompleted: !!data.user.profileCompleted,
      photoUrl: data.user.photoUrl || ''
    })

    return data.user
  }, [])

  const logout = useCallback(() => {
    clearToken()
    setUser(null)
  }, [])

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    refreshProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthProvider
