import { useState, useCallback } from 'react'
import axios from 'axios'

export function useAuth() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const login = useCallback(async (username, password, role = 'employee') => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.post('/api/auth/login', {
        username,
        password,
        role
      })
      // persist role locally for UI role-based controls
      try {
        if (response.data?.role) localStorage.setItem('authRole', response.data.role)
      } catch (e) {
        // ignore localStorage errors
      }
      return response.data.token
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Falha no login'
      setError(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { login, loading, error }
}
