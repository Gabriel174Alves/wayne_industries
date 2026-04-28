import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import InventoryGrid from '../components/InventoryGrid'
import ModalDetail from '../components/ModalDetail'
import { useQuery } from '../hooks/useQuery'
import { useInventory } from '../context/InventoryContext'

export default function Armory({ token }) {
  const [selectedItem, setSelectedItem] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { state, setAllies, setInventory } = useInventory()

  // Fetch allies
  const { data: alliesData, loading: alliesLoading } = useQuery('/api/allies', {
    token,
    onSuccess: (data) => setAllies(data)
  })

  // Fetch inventory
  const { data: inventoryData, loading: inventoryLoading } = useQuery('/api/inventory', {
    token,
    onSuccess: (data) => setInventory(data)
  })

  const allItems = [
    ...(state.allies || []),
    ...(state.inventory || [])
  ]

  const handleItemClick = (item) => {
    setSelectedItem(item)
    setIsModalOpen(true)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold font-mono text-hud-glow mb-2">
          ARSENAL
        </h1>
        <p className="text-hud-text font-mono text-sm">
          [SISTEMA DE GESTÃO DE INVENTÁRIO DE ATIVOS WAYNE INDUSTRIES - v1.0]
        </p>
      </motion.div>

      {alliesLoading || inventoryLoading ? (
        <div className="flex items-center justify-center h-96">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-hud-glow font-mono text-xl"
          >
            [ESCANEANDO ATIVOS...]
          </motion.div>
        </div>
      ) : allItems.length > 0 ? (
        <>
          <div className="mb-4 text-hud-text font-mono text-sm">
            Total de itens: <span className="text-hud-highlight">{allItems.length}</span>
          </div>
          <InventoryGrid
            items={allItems}
            onItemClick={handleItemClick}
            gridCols={5}
          />
        </>
      ) : (
        <div className="text-center text-hud-text font-mono py-12">
          [NENHUM ITEM ENCONTRADO]
        </div>
      )}

      <ModalDetail
        isOpen={isModalOpen}
        item={selectedItem}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}
