import { useMemo } from 'react'
import { motion } from 'framer-motion'
import ItemCard from './ItemCard'

export default function InventoryGrid({ items, onItemClick, gridCols = 5 }) {
  const itemsPerPage = gridCols * 4 // 5x4 default = 20 items per page
  const pages = Math.ceil(items.length / itemsPerPage)

  const paginatedItems = useMemo(() => {
    return Array.from({ length: pages }, (_, pageIdx) =>
      items.slice(pageIdx * itemsPerPage, (pageIdx + 1) * itemsPerPage)
    )
  }, [items, pages, itemsPerPage])

  return (
    <div className="space-y-6">
      {paginatedItems.map((pageItems, pageIdx) => (
        <motion.div
          key={pageIdx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: pageIdx * 0.1 }}
          className={`grid gap-4 auto-rows-max`}
          style={{
            gridTemplateColumns: `repeat(auto-fill, minmax(150px, 1fr))`
          }}
        >
          {pageItems.map((item, idx) => (
            <ItemCard
              key={`${item.id ?? 'item'}-${pageIdx}-${idx}`}
              item={item}
              isAlly={item.powerstats !== undefined}
              onClick={() => onItemClick(item)}
            />
          ))}
        </motion.div>
      ))}
    </div>
  )
}
