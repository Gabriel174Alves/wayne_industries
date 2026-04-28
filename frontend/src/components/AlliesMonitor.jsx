import React, { useState } from 'react'
import axios from 'axios'

export default function AlliesMonitor({ allies = [], token }) {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)

  const authToken = token || (typeof window !== 'undefined' && localStorage.getItem('authToken'))

  const fetchAndSave = async () => {
    if (!query) return alert('Digite um nome ou ID')
    setLoading(true)
    try {
      // send as POST with JSON { name: query } and Authorization header
      const resp = await axios.post('/api/allies/fetch', { name: query }, { headers: { Authorization: `Bearer ${authToken}` } })
      alert(`Aliado salvo: ${resp.data.name}`)
      // optional: refresh page or rely on parent refetch
    } catch (err) {
      console.error(err)
      alert('Falha ao buscar/salvar aliado')
    } finally {
      setLoading(false)
    }
  }

  if (!allies || allies.length === 0) return (
    <div className="hud-card p-4">
      <div className="text-hud-text">Nenhum aliado carregado.</div>
      <div className="mt-3 flex gap-2">
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Nome ou ID do herói" className="px-2 py-1 w-60" />
        <button onClick={fetchAndSave} disabled={loading} className="px-3 py-1 border border-hud-highlight text-hud-highlight">{loading ? 'BUSCANDO...' : 'Buscar & Salvar'}</button>
      </div>
    </div>
  )

  return (
    <div className="hud-card p-4 space-y-4">
      <h3 className="text-hud-glow font-mono font-bold">MONITOR DE ALIADOS</h3>

      <div className="mt-2 flex gap-2">
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Nome ou ID do herói" className="px-2 py-1 w-60" />
        <button onClick={fetchAndSave} disabled={loading} className="px-3 py-1 border border-hud-highlight text-hud-highlight">{loading ? 'BUSCANDO...' : 'Buscar & Salvar'}</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {allies.map((a) => (
          <div key={a.id || a.hero_id || a.name} className="p-3 bg-hud-dark/40 rounded">
            <div className="flex items-center gap-3 mb-2">
              {a.image ? <img src={a.image} alt={a.name} className="w-10 h-10 rounded" /> : <div className="w-10 h-10 bg-hud-border rounded flex items-center justify-center">{a.name?.charAt(0)}</div>}
              <div>
                <div className="text-sm text-hud-text font-mono">{a.name}</div>
                <div className="text-xs text-hud-text font-mono">{a.work?.base || ''}</div>
              </div>
            </div>

            <div className="space-y-2">
              {['Intelligence','Strength','Speed','Durability','Power','Combat'].map((stat) => (
                <div key={stat} className="text-xs">
                  <div className="flex justify-between text-hud-text font-mono mb-1"><span>{stat}</span><span>{a.powerstats?.[stat] ?? 0}</span></div>
                  <div className="h-2 bg-hud-border rounded overflow-hidden">
                    <div className="h-full bg-hud-highlight" style={{ width: `${Math.min(100, Number(a.powerstats?.[stat] || 0))}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
