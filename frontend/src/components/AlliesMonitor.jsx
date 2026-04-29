import React, { useState, useEffect } from 'react'
import axios from 'axios'
import RoleBasedAccess, { usePermissions } from './RoleBasedAccess'

export default function AlliesMonitor({ token }) {
  const [allies, setAllies] = useState([])
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newAlly, setNewAlly] = useState({
    name: '',
    hero_id: '',
    biography: {
      publisher: 'DC Comics',
      alignment: 'good'
    },
    powerstats: {
      intelligence: 50,
      strength: 50,
      speed: 50,
      durability: 50,
      power: 50,
      combat: 50
    },
    work: {
      occupation: '',
      base: ''
    },
    connections: '',
    appearance: {
      gender: '',
      race: ''
    }
  })

  const authToken = token || (typeof window !== 'undefined' && localStorage.getItem('authToken'))

  const headers = { Authorization: `Bearer ${authToken}` }
  const [role, setRole] = useState((typeof window !== 'undefined' && localStorage.getItem('authRole')) || '')
  const permissions = usePermissions(role)

  const load = async () => {
    setLoading(true)
    try {
      const resp = await axios.get('/api/allies', { headers })
      setAllies(resp.data || [])
    } catch (err) {
      console.error(err)
      alert('Falha ao carregar aliados')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  // fetch role from server if token present and role not in localStorage
  useEffect(() => {
    if (!role && authToken) {
      axios.get('/api/auth/verify', { headers }).then(r => {
        const user = r.data?.user || {}
        const rname = (user.role || '').toLowerCase()
        setRole(rname)
        try { localStorage.setItem('authRole', rname) } catch (e) {}
      }).catch(() => {})
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken])

  const createAlly = async (payload) => {
    setLoading(true)
    try {
      const resp = await axios.post('/api/allies', payload, { headers })
      setAllies(prev => [...prev, resp.data])
      return resp.data
    } catch (err) {
      console.error(err)
      const errorMsg = err.response?.data?.error || 'Falha ao criar aliado'
      alert(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const updateAlly = async (id, payload) => {
    setLoading(true)
    try {
      const resp = await axios.put(`/api/allies/${id}`, payload, { headers })
      setAllies(prev => prev.map(a => a.id === id ? resp.data : a))
      return resp.data
    } catch (err) {
      console.error(err)
      const errorMsg = err.response?.data?.error || 'Falha ao atualizar aliado'
      alert(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const deleteAlly = async (id) => {
    if (!confirm('Confirma remoção do aliado?')) return
    setLoading(true)
    try {
      await axios.delete(`/api/allies/${id}`, { headers })
      setAllies(prev => prev.filter(a => a.id !== id))
    } catch (err) {
      console.error(err)
      const errorMsg = err.response?.data?.error || 'Falha ao remover aliado'
      alert(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async () => {
    if (!newAlly.name) return alert('Nome do aliado é obrigatório')
    
    const payload = {
      hero_id: newAlly.hero_id || `${Date.now()}`, 
      name: newAlly.name, 
      biography: newAlly.biography,
      powerstats: newAlly.powerstats,
      work: newAlly.work,
      connections: newAlly.connections,
      appearance: newAlly.appearance
    }
    await createAlly(payload)
    setNewAlly({
      name: '',
      hero_id: '',
      biography: {
        publisher: 'DC Comics',
        alignment: 'good'
      },
      powerstats: {
        intelligence: 50,
        strength: 50,
        speed: 50,
        durability: 50,
        power: 50,
        combat: 50
      },
      work: {
        occupation: '',
        base: ''
      },
      connections: '',
      appearance: {
        gender: '',
        race: ''
      }
    })
    setShowAddForm(false)
  }

  return (
    <div className="hud-card p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-hud-glow font-mono font-bold">MONITOR DE ALIADOS</h3>
        <div className="text-hud-text font-mono text-xs">
          Acesso: <span className="text-hud-highlight">{role.toUpperCase()}</span>
        </div>
      </div>

      <RoleBasedAccess requiredRole="manager" currentUserRole={role}>
        <div className="space-y-4">
          <div className="flex gap-2">
            <button 
              onClick={() => setShowAddForm(!showAddForm)} 
              className="px-3 py-1 border border-hud-highlight text-hud-highlight"
            >
              {showAddForm ? 'Cancelar' : 'Adicionar Aliado'}
            </button>
            <button onClick={load} className="px-3 py-1 border">Atualizar Lista</button>
          </div>
          
          {showAddForm && (
            <div className="bg-hud-dark/30 p-4 rounded space-y-3">
              <h4 className="text-hud-glow font-mono font-bold">NOVO ALIADO</h4>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-hud-text font-mono text-xs mb-1">Nome*</label>
                  <input 
                    value={newAlly.name} 
                    onChange={e => setNewAlly({...newAlly, name: e.target.value})} 
                    className="w-full px-2 py-1" 
                    placeholder="Nome do herói"
                  />
                </div>
                <div>
                  <label className="block text-hud-text font-mono text-xs mb-1">Hero ID</label>
                  <input 
                    value={newAlly.hero_id} 
                    onChange={e => setNewAlly({...newAlly, hero_id: e.target.value})} 
                    className="w-full px-2 py-1" 
                    placeholder="ID único"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-hud-text font-mono text-xs mb-1">Publisher*</label>
                  <select 
                    value={newAlly.biography.publisher} 
                    onChange={e => setNewAlly({...newAlly, biography: {...newAlly.biography, publisher: e.target.value}})} 
                    className="w-full px-2 py-1"
                  >
                    <option value="DC Comics">DC Comics</option>
                    <option value="Marvel Comics">Marvel Comics</option>
                  </select>
                </div>
                <div>
                  <label className="block text-hud-text font-mono text-xs mb-1">Alignment*</label>
                  <select 
                    value={newAlly.biography.alignment} 
                    onChange={e => setNewAlly({...newAlly, biography: {...newAlly.biography, alignment: e.target.value}})} 
                    className="w-full px-2 py-1"
                  >
                    <option value="good">Good</option>
                    <option value="neutral">Neutral</option>
                    <option value="bad">Bad</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-hud-text font-mono text-xs mb-1">Habilidades (Powerstats)</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(newAlly.powerstats).map(([stat, value]) => (
                    <div key={stat}>
                      <label className="block text-hud-text font-mono text-xs mb-1">{stat}</label>
                      <input 
                        type="number" 
                        min="0" 
                        max="100"
                        value={value} 
                        onChange={e => setNewAlly({...newAlly, powerstats: {...newAlly.powerstats, [stat]: parseInt(e.target.value) || 0}})} 
                        className="w-full px-2 py-1" 
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-hud-text font-mono text-xs mb-1">Ocupação</label>
                  <input 
                    value={newAlly.work.occupation} 
                    onChange={e => setNewAlly({...newAlly, work: {...newAlly.work, occupation: e.target.value}})} 
                    className="w-full px-2 py-1" 
                    placeholder="Ex: Vigilante"
                  />
                </div>
                <div>
                  <label className="block text-hud-text font-mono text-xs mb-1">Base</label>
                  <input 
                    value={newAlly.work.base} 
                    onChange={e => setNewAlly({...newAlly, work: {...newAlly.work, base: e.target.value}})} 
                    className="w-full px-2 py-1" 
                    placeholder="Ex: Gotham City"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-hud-text font-mono text-xs mb-1">Conexões</label>
                  <input 
                    value={newAlly.connections} 
                    onChange={e => setNewAlly({...newAlly, connections: e.target.value})} 
                    className="w-full px-2 py-1" 
                    placeholder="Ex: Wayne Industries"
                  />
                </div>
                <div>
                  <label className="block text-hud-text font-mono text-xs mb-1">Gênero</label>
                  <select 
                    value={newAlly.appearance.gender} 
                    onChange={e => setNewAlly({...newAlly, appearance: {...newAlly.appearance, gender: e.target.value}})} 
                    className="w-full px-2 py-1"
                  >
                    <option value="">Selecione</option>
                    <option value="Male">Masculino</option>
                    <option value="Female">Feminino</option>
                    <option value="Unknown">Desconhecido</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={onSubmit} 
                  disabled={loading} 
                  className="px-4 py-2 border border-hud-highlight text-hud-highlight"
                >
                  {loading ? 'Salvando...' : 'Criar Aliado'}
                </button>
                <button 
                  onClick={() => setShowAddForm(false)} 
                  className="px-4 py-2 border border-hud-border"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </RoleBasedAccess>
      
      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="p-2">Nome</th>
              <th>Publisher</th>
              <th>Alignment</th>
              <th>Powerstats</th>
              <th>Fetched At</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {allies.map(a => (
              <tr key={a.id} className="border-t">
                <td className="p-2">{a.name}</td>
                <td>{a.biography?.publisher || '-'}</td>
                <td>{a.biography?.alignment || '-'}</td>
                <td>
                  {a.powerstats ? Object.entries(a.powerstats).map(([k,v]) => <span key={k} className="mr-2">{k}:{v}</span>) : '-'}
                </td>
                <td>{a.fetched_at ? new Date(a.fetched_at * 1000).toLocaleString() : '-'}</td>
                <td className="space-x-2">
                  <RoleBasedAccess requiredRole="manager" currentUserRole={role}>
                    <button onClick={() => { setEditing(a); }} className="px-2 py-1 border">Editar</button>
                  </RoleBasedAccess>
                  <RoleBasedAccess requiredRole="admin" currentUserRole={role}>
                    <button onClick={() => deleteAlly(a.id)} className="px-2 py-1 border text-red-500">Remover</button>
                  </RoleBasedAccess>
                  <RoleBasedAccess requiredRole="employee" currentUserRole={role} fallback={<span className="text-hud-text font-mono text-xs">Visualização</span>}>
                  </RoleBasedAccess>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="p-3 bg-hud-dark/30 rounded">
          <h4 className="font-bold text-hud-glow">Editar aliado: {editing.name}</h4>
          
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <label className="block text-hud-text font-mono text-xs mb-1">Nome</label>
              <input 
                className="w-full px-2 py-1" 
                value={editing.name} 
                onChange={e => setEditing({...editing, name: e.target.value})} 
              />
            </div>
            <div>
              <label className="block text-hud-text font-mono text-xs mb-1">Hero ID</label>
              <input 
                className="w-full px-2 py-1" 
                value={editing.hero_id || ''} 
                onChange={e => setEditing({...editing, hero_id: e.target.value})} 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <label className="block text-hud-text font-mono text-xs mb-1">Publisher</label>
              <select 
                className="w-full px-2 py-1"
                value={editing.biography?.publisher || ''} 
                onChange={e => setEditing({...editing, biography:{...(editing.biography||{}), publisher: e.target.value}})} 
              >
                <option value="">Selecione</option>
                <option value="DC Comics">DC Comics</option>
                <option value="Marvel Comics">Marvel Comics</option>
              </select>
            </div>
            <div>
              <label className="block text-hud-text font-mono text-xs mb-1">Alignment</label>
              <select 
                className="w-full px-2 py-1"
                value={editing.biography?.alignment || ''} 
                onChange={e => setEditing({...editing, biography:{...(editing.biography||{}), alignment: e.target.value}})} 
              >
                <option value="">Selecione</option>
                <option value="good">Good</option>
                <option value="neutral">Neutral</option>
                <option value="bad">Bad</option>
              </select>
            </div>
          </div>

          <div className="mt-3">
            <label className="block text-hud-text font-mono text-xs mb-1">Habilidades (Powerstats)</label>
            <div className="grid grid-cols-3 gap-2">
              {editing.powerstats && Object.entries(editing.powerstats).map(([stat, value]) => (
                <div key={stat}>
                  <label className="block text-hud-text font-mono text-xs mb-1">{stat}</label>
                  <input 
                    type="number" 
                    min="0" 
                    max="100"
                    className="w-full px-2 py-1" 
                    value={value} 
                    onChange={e => setEditing({...editing, powerstats: {...(editing.powerstats||{}), [stat]: parseInt(e.target.value) || 0}})} 
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <label className="block text-hud-text font-mono text-xs mb-1">Ocupação</label>
              <input 
                className="w-full px-2 py-1" 
                value={editing.work?.occupation || ''} 
                onChange={e => setEditing({...editing, work:{...(editing.work||{}), occupation: e.target.value}})} 
              />
            </div>
            <div>
              <label className="block text-hud-text font-mono text-xs mb-1">Base</label>
              <input 
                className="w-full px-2 py-1" 
                value={editing.work?.base || ''} 
                onChange={e => setEditing({...editing, work:{...(editing.work||{}), base: e.target.value}})} 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <label className="block text-hud-text font-mono text-xs mb-1">Conexões</label>
              <input 
                className="w-full px-2 py-1" 
                value={editing.connections || ''} 
                onChange={e => setEditing({...editing, connections: e.target.value})} 
              />
            </div>
            <div>
              <label className="block text-hud-text font-mono text-xs mb-1">Gênero</label>
              <select 
                className="w-full px-2 py-1"
                value={editing.appearance?.gender || ''} 
                onChange={e => setEditing({...editing, appearance:{...(editing.appearance||{}), gender: e.target.value}})} 
              >
                <option value="">Selecione</option>
                <option value="Male">Masculino</option>
                <option value="Female">Feminino</option>
                <option value="Unknown">Desconhecido</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button 
              onClick={() => { updateAlly(editing.id, editing); setEditing(null) }} 
              className="px-4 py-2 border border-hud-highlight text-hud-highlight"
            >
              Salvar Alterações
            </button>
            <button 
              onClick={() => setEditing(null)} 
              className="px-4 py-2 border border-hud-border"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
