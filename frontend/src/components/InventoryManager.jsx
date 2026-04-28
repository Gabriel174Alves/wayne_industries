import React, { useState } from 'react'
import axios from 'axios'

export default function InventoryManager({ inventory = [], token, onRefresh }) {
  const [editing, setEditing] = useState(null)
  const [qty, setQty] = useState(0)
  const [showAdd, setShowAdd] = useState(false)
  const [newItem, setNewItem] = useState({ name: '', category: 'Equipment', quantity: 1, description: '', icon: '🎒' })

  const role = (typeof window !== 'undefined' && localStorage.getItem('authRole')) || 'employee'

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
    try {
      await axios.post('/api/inventory', newItem, { headers: { Authorization: `Bearer ${token}` } })
      setShowAdd(false)
      setNewItem({ name: '', category: 'Equipment', quantity: 1, description: '', icon: '🎒' })
      onRefresh && onRefresh()
    } catch (err) {
      console.error('Create failed', err)
      alert('Falha ao criar item')
    }
  }

  return (
    <div className="hud-card p-4 mt-6">
      <h3 className="text-hud-glow font-mono font-bold mb-3">GESTÃO DE RECURSOS</h3>

      <div className="grid gap-3">
        <div className="flex items-center justify-between mb-2">
          <div />
          <div>
            <button onClick={() => setShowAdd(!showAdd)} className="px-3 py-1 border border-hud-glow">Adicionar Item</button>
          </div>
        </div>
        {showAdd && (
          <div className="bg-hud-dark/30 p-3 rounded mb-2">
            <div className="grid gap-2">
              <input placeholder="Nome" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} className="px-2 py-1" />
              <input placeholder="Categoria" value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })} className="px-2 py-1" />
              <input type="number" placeholder="Quantidade" value={newItem.quantity} onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })} className="px-2 py-1" />
              <input placeholder="Descrição" value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} className="px-2 py-1" />
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
              <input type="number" className="w-20 px-2 py-1" value={editing?.id === it.id ? qty : it.quantity || 0} onChange={(e) => setQty(e.target.value)} />
              {editing?.id === it.id ? (
                <>
                  <button onClick={saveQty} className="px-3 py-1 border border-hud-highlight text-hud-highlight">Salvar</button>
                  <button onClick={() => setEditing(null)} className="px-3 py-1 border border-hud-border">Cancelar</button>
                </>
              ) : (
                <>
                  <button onClick={() => startEdit(it)} className="px-3 py-1 border border-hud-glow">Editar</button>
                  <button onClick={() => handleDelete(it.id)} className="px-3 py-1 border border-red-600 text-red-500">Excluir</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
