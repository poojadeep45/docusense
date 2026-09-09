import { useState } from 'react'
import { useAuth } from './context/AuthContext.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'

export default function App() {
  const { isAuthenticated } = useAuth()
  const [mode, setMode] = useState('login')

  if (isAuthenticated) {
    return <Dashboard />
  }

  return mode === 'login' ? (
    <Login onSwitchToRegister={() => setMode('register')} />
  ) : (
    <Register onSwitchToLogin={() => setMode('login')} />
  )
}
