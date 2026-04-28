import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { InventoryProvider } from './context/InventoryContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import Navbar from './components/Navbar'
import Armory from './pages/Armory'
import ControlTower from './pages/ControlTower'
import AccessControl from './pages/AccessControl'

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('authToken'))
  const [isLoadingAuth, setIsLoadingAuth] = useState(false)

  useEffect(() => {
    // Check if token is valid on mount
    if (token) {
      validateToken(token)
    }
  }, [])

  const validateToken = async (authToken) => {
    setIsLoadingAuth(true)
    try {
      // Simulate validation delay
      await new Promise(resolve => setTimeout(resolve, 500))
      // In a real app, validate at backend
    } catch (err) {
      console.error('Token validation failed:', err)
      setToken(null)
      localStorage.removeItem('authToken')
    } finally {
      setIsLoadingAuth(false)
    }
  }

  const handleLogin = (newToken) => {
    localStorage.setItem('authToken', newToken)
    setToken(newToken)
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    setToken(null)
  }

  if (isLoadingAuth) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-hud-dark">
        <div className="text-hud-glow animate-pulse text-xl font-mono">
          [INITIALIZING SECURITY PROTOCOLS...]
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <Router>
        {token ? (
          <InventoryProvider>
            <div className="relative w-screen h-screen flex flex-col overflow-hidden">
              <Navbar onLogout={handleLogout} />
              <div className="flex-1 relative z-10 overflow-auto">
                <Routes>
                  <Route path="/armory" element={<Armory token={token} />} />
                  <Route path="/control-tower" element={<ControlTower token={token} />} />
                  <Route path="*" element={<Navigate to="/armory" replace />} />
                </Routes>
              </div>
            </div>
          </InventoryProvider>
        ) : (
          <Routes>
            <Route path="/login" element={<AccessControl onLogin={handleLogin} />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        )}
      </Router>
    </ErrorBoundary>
  )
}

export default App
