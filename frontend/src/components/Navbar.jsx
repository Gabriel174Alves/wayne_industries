import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function Navbar({ onLogout }) {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const navItems = [
    { path: '/armory', label: 'ARSENAL', icon: '⚔️' },
    { path: '/control-tower', label: 'TORRE DE CONTROLE', icon: '🛰️' },
  ]

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative z-20 bg-hud-dark border-b border-hud-border px-6 py-4"
    >
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo */}
        <Link to="/armory" className="flex items-center gap-2">
          <div className="text-hud-highlight font-bold text-lg font-mono">
            WAYNE INDUSTRIES
          </div>
          <div className="text-hud-glow text-xs font-mono">[GERENCIAMENTO DE ATIVOS]</div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`font-mono text-sm transition-all ${
                location.pathname === item.path
                  ? 'text-hud-glow border-b-2 border-hud-glow'
                  : 'text-hud-text hover:text-hud-glow'
              }`}
            >
              {item.icon} {item.label}
            </Link>
          ))}
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={onLogout}
            className="px-4 py-2 border border-hud-border text-hud-text hover:border-hud-highlight hover:text-hud-highlight transition-all font-mono text-xs"
          >
            [SAIR]
          </button>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-hud-text hover:text-hud-glow"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden mt-4 pt-4 border-t border-hud-border space-y-2"
        >
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMenuOpen(false)}
              className={`block px-4 py-2 font-mono text-sm transition-all ${
                location.pathname === item.path
                  ? 'text-hud-glow border-l-2 border-hud-glow'
                  : 'text-hud-text hover:text-hud-glow'
              }`}
            >
              {item.icon} {item.label}
            </Link>
          ))}
        </motion.div>
      )}
    </motion.nav>
  )
}
