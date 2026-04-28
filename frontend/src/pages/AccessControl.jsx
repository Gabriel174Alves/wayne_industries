import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'

export default function AccessControl({ onLogin }) {
  const [step, setStep] = useState('biometric') // 'biometric' -> 'login'
  const [username, setUsername] = useState('batman')
  const [password, setPassword] = useState('wayne123')
  const [selectedRole, setSelectedRole] = useState('employee')
  const [scanProgress, setScanProgress] = useState(0)
  const [error, setError] = useState(null)
  const { login, loading } = useAuth()

  // Animated biometric scan
  const handleStartScan = () => {
    setScanProgress(0)
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setStep('login')
          return 100
        }
        return prev + Math.random() * 30
      })
    }, 300)
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      const token = await login(username, password, selectedRole)
      onLogin(token)
    } catch (err) {
      setError('Autenticação falhou. Tente: batman / wayne123')
    }
  }

  return (
    <div className="w-screen h-screen bg-hud-dark flex items-center justify-center overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#00AEEF" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Main container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Biometric Scan Screen */}
        {step === 'biometric' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-8"
          >
            <div className="text-center mb-4">
              <h1 className="text-3xl font-bold text-hud-glow font-mono mb-2">
                WAYNE INDUSTRIES
              </h1>
              <p className="text-hud-text font-mono text-sm">[CONTROLE DE ACESSO BIOMÉTRICO]</p>
            </div>

            {/* Scan Circle */}
            <div className="relative w-48 h-48">
              {/* Outer ring */}
              <motion.div
                className="absolute inset-0 border-2 border-hud-glow rounded-full"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 3, linear: true }}
              />

              {/* Scan line */}
              <motion.div
                className="absolute inset-0 border-t-2 border-hud-highlight rounded-full"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, linear: true }}
              />

              {/* Progress circle */}
              <svg className="absolute inset-0 w-full h-full">
                <circle
                  cx="50%"
                  cy="50%"
                  r="42%"
                  fill="none"
                  stroke="#00AEEF"
                  strokeWidth="2"
                  strokeDasharray={`${scanProgress * 2.64} 264`}
                  opacity={0.5}
                />
              </svg>

              {/* Center icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-5xl">👁️</div>
              </div>
            </div>

            {/* Scan status */}
            <div className="text-center">
              <p className="text-hud-text font-mono text-sm mb-2">
                Escaneando padrão retinal...
              </p>
              <p className="text-hud-glow font-mono font-bold">
                {Math.floor(scanProgress)}%
              </p>
            </div>

            {scanProgress < 100 ? (
              <button
                onClick={handleStartScan}
                disabled={scanProgress > 0}
                className="px-6 py-2 border border-hud-glow text-hud-glow hover:shadow-hud-glow transition-all font-mono disabled:opacity-50"
              >
                INICIAR ESCANEAMENTO
              </button>
            ) : (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setStep('login')}
                className="px-6 py-2 border border-hud-highlight text-hud-highlight hover:shadow-hud-glow transition-all font-mono"
              >
                ESCANEAMENTO CONCLUÍDO
              </motion.button>
            )}
          </motion.div>
        )}

        {/* Login Screen */}
        {step === 'login' && (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleLogin}
            className="space-y-4 border border-hud-border p-6 bg-hud-dark"
          >
            <h2 className="text-2xl font-bold text-hud-glow font-mono mb-4">
              CREDENTIALS REQUIRED
            </h2>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-3 border border-red-500 bg-red-500 bg-opacity-10 text-red-400 font-mono text-sm"
              >
                {error}
              </motion.div>
            )}

            <div>
              <label className="block text-hud-text font-mono text-sm mb-2">USUÁRIO</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-hud-text font-mono text-sm mb-2">SENHA</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-hud-text font-mono text-sm mb-2">NÍVEL DE ACESSO</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-3 py-2"
              >
                <option value="employee">Funcionário</option>
                <option value="manager">Gerente</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 border border-hud-glow text-hud-glow hover:shadow-hud-glow transition-all font-mono disabled:opacity-50"
            >
              {loading ? 'VERIFICANDO...' : 'CONCEDER ACESSO'}
            </button>

            <button
              type="button"
              onClick={() => setStep('biometric')}
              className="w-full px-4 py-2 border border-hud-border text-hud-text hover:border-hud-glow transition-all font-mono"
            >
              VOLTAR
            </button>
          </motion.form>
        )}
      </motion.div>
    </div>
  )
}
