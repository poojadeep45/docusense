import { createContext, useContext, useState, useCallback } from 'react'
import { api } from '../services/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('docusense_token'))
  const [username, setUsername] = useState(() => localStorage.getItem('docusense_username'))

  const login = useCallback(async (usernameInput, password) => {
    const data = await api.login({ username: usernameInput, password })
    localStorage.setItem('docusense_token', data.token)
    localStorage.setItem('docusense_username', usernameInput)
    setToken(data.token)
    setUsername(usernameInput)
  }, [])

  const register = useCallback(async (usernameInput, password, email) => {
    const data = await api.register({ username: usernameInput, password, email })
    localStorage.setItem('docusense_token', data.token)
    localStorage.setItem('docusense_username', usernameInput)
    setToken(data.token)
    setUsername(usernameInput)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('docusense_token')
    localStorage.removeItem('docusense_username')
    setToken(null)
    setUsername(null)
  }, [])

  const value = { token, username, isAuthenticated: !!token, login, register, logout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
