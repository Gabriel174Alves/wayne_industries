import React from 'react'

export default function SummaryCards({ allies = [], inventory = [], logs = [] }) {
  const alliesCount = allies.length
  const totalItems = inventory.reduce((sum, it) => sum + (it.quantity || 0), 0)
  // `logs` may be an array or an object like { logs: [...] } depending on API
  const logsArr = Array.isArray(logs) ? logs : (logs && logs.logs) || []
  const recentLogs = logsArr.slice(-5).reverse()

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="hud-card p-4">
        <h3 className="text-sm font-mono text-hud-text">ALIADOS ATIVOS</h3>
        <div className="text-3xl font-bold text-hud-glow font-mono">{alliesCount}</div>
      </div>

      <div className="hud-card p-4">
        <h3 className="text-sm font-mono text-hud-text">TOTAL DE ITENS</h3>
        <div className="text-3xl font-bold text-hud-glow font-mono">{totalItems}</div>
      </div>

      <div className="hud-card p-4">
        <h3 className="text-sm font-mono text-hud-text">LOGS RECENTES</h3>
        <div className="text-xs font-mono text-hud-text mt-2">
          {recentLogs.length > 0 ? (
            recentLogs.map((l, i) => (
              <div key={i} className="truncate">{l}</div>
            ))
          ) : (
            <div className="text-hud-text">Sem logs recentes</div>
          )}
        </div>
      </div>
    </div>
  )
}
