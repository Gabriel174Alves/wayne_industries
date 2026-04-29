import React, { useState, useEffect } from 'react'
import axios from 'axios'
import RoleBasedAccess, { usePermissions } from './RoleBasedAccess'

export default function InventoryManager({ inventory = [], token, onRefresh }) {
  const [editing, setEditing] = useState(null)
  const [qty, setQty] = useState(0)
  const [showAdd, setShowAdd] = useState(false)
  const [newItem, setNewItem] = useState({ name: '', category: 'Equipment', quantity: 1, description: '', icon: '🎒' })

  const [role, setRole] = useState((typeof window !== 'undefined' && localStorage.getItem('authRole')) || 'employee')
  const permissions = usePermissions(role)

  // If token provided and role not present, verify with backend
  useEffect(() => {
    if ((!role || role === 'employee') && token) {
      axios.get('/api/auth/verify', { headers: { Authorization: `Bearer ${token}` } }).then(r => {
        const rname = (r.data?.user?.role || 'employee').toLowerCase()
        setRole(rname)
        try { localStorage.setItem('authRole', rname) } catch (e) {}
      }).catch(() => {})
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const startEdit = (item) => {
    setEditing(item)
    setQty(item.quantity || 0)
  }

  const saveQty = async () => {
    if (!editing) return
    try {
      await axios.put(`/api/inventory/${editing.id}`, { ...editing, quantity: Number(qty) }, { headers: { Authorization: `Bearer ${token}` } })
      setEditing(null)
      onRefresh && onRefresh()
    } catch (err) {
      console.error('Failed update', err)
      alert('Falha ao atualizar quantidade')
    }
  }

  const handleDelete = async (id) => {
    if (role !== 'admin') return alert('Apenas administradores podem remover itens')
    if (!confirm('Deseja realmente excluir este item?')) return
    try {
      await axios.delete(`/api/inventory/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      onRefresh && onRefresh()
    } catch (err) {
      console.error('Delete failed', err)
      alert('Falha ao excluir item')
    }
  }

  const createItem = async () => {
    if (!newItem.name.trim()) {
      alert('Nome do item é obrigatório')
      return
    }
    try {
      await axios.post('/api/inventory', newItem, { headers: { Authorization: `Bearer ${token}` } })
      setShowAdd(false)
      setNewItem({ name: '', category: 'Equipment', quantity: 1, description: '', icon: '🎒' })
      onRefresh && onRefresh()
    } catch (err) {
      console.error('Create failed', err)
      const errorMsg = err.response?.data?.error || 'Falha ao criar item'
      alert(errorMsg)
    }
  }

  return (
    <div className="hud-card p-4 mt-6">
      <h3 className="text-hud-glow font-mono font-bold mb-3">GESTÃO DE RECURSOS</h3>

      <div className="grid gap-3">
        <div className="flex items-center justify-between mb-2">
          <div className="text-hud-text font-mono text-xs">
            Nível de Acesso: <span className="text-hud-highlight">{role.toUpperCase()}</span>
          </div>
          <RoleBasedAccess requiredRole="manager" currentUserRole={role}>
            <div>
              <button onClick={() => setShowAdd(!showAdd)} className="px-3 py-1 border border-hud-glow">Adicionar Item</button>
            </div>
          </RoleBasedAccess>
        </div>
        {showAdd && (
          <div className="bg-hud-dark/30 p-3 rounded mb-2">
            <div className="grid gap-2">
              <input placeholder="Nome" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} className="px-2 py-1" />
              <div>
                <label className="block text-hud-text font-mono text-xs mb-1">Categoria</label>
                <select 
                  value={newItem.category} 
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })} 
                  className="w-full px-2 py-1"
                >
                  <option value="Equipment">🎒 Equipamento</option>
                  <option value="Vehicle">🚗 Veículo</option>
                  <option value="Weapon">⚔️ Arma</option>
                  <option value="Technology">💻 Tecnologia</option>
                  <option value="Medical">🏥 Médico</option>
                </select>
              </div>
              <input type="number" placeholder="Quantidade" value={newItem.quantity} onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })} className="px-2 py-1" />
              <input placeholder="Descrição" value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} className="px-2 py-1" />
              <div>
                <label className="block text-hud-text font-mono text-xs mb-1">Ícone</label>
                <select 
                  value={newItem.icon} 
                  onChange={(e) => setNewItem({ ...newItem, icon: e.target.value })} 
                  className="w-full px-2 py-1"
                >
                  <option value="🎒">🎒 Equipamento</option>
                  <option value="🚗">🚗 Veículo</option>
                  <option value="🚙">🚙 SUV</option>
                  <option value="🏍️">🏍️ Moto</option>
                  <option value="🚁">🚁 Helicóptero</option>
                  <option value="⚔️">⚔️ Arma</option>
                  <option value="💻">💻 Computador</option>
                  <option value="📱">📱 Dispositivo</option>
                  <option value="🏥">🏥 Médico</option>
                  <option value="🛡️">🛡️ Proteção</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button onClick={createItem} className="px-3 py-1 border border-hud-highlight text-hud-highlight">Criar</button>
                <button onClick={() => setShowAdd(false)} className="px-3 py-1 border border-hud-border">Cancelar</button>
              </div>
            </div>
          </div>
        )}
        {inventory.map((it) => (
          <div key={it.id} className="flex items-center justify-between bg-hud-dark/40 p-3 rounded">
            <div>
              <div className="text-sm text-hud-text font-mono">{it.name}</div>
              <div className="text-xs text-hud-text font-mono">{it.category}</div>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-hud-text font-mono">Qtd:</div>
              <RoleBasedAccess requiredRole="manager" currentUserRole={role}>
                <input type="number" className="w-20 px-2 py-1" value={editing?.id === it.id ? qty : it.quantity || 0} onChange={(e) => setQty(e.target.value)} />
              </RoleBasedAccess>
              <RoleBasedAccess requiredRole="manager" currentUserRole={role}>
                {editing?.id === it.id ? (
                  <>
                    <button onClick={saveQty} className="px-3 py-1 border border-hud-highlight text-hud-highlight">Salvar</button>
                    <button onClick={() => setEditing(null)} className="px-3 py-1 border border-hud-border">Cancelar</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEdit(it)} className="px-3 py-1 border border-hud-glow">Editar</button>
                    <RoleBasedAccess requiredRole="admin" currentUserRole={role}>
                      <button onClick={() => handleDelete(it.id)} className="px-3 py-1 border border-red-600 text-red-500">Excluir</button>
                    </RoleBasedAccess>
                  </>
                )}
              </RoleBasedAccess>
              <RoleBasedAccess requiredRole="employee" currentUserRole={role} fallback={<span className="text-hud-text font-mono text-xs">Somente visualização</span>}>
              </RoleBasedAccess>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
