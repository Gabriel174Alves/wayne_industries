import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import RadarChart from './RadarChart'

export default function ModalDetail({ isOpen, item, onClose }) {
  if (!item) return null

  const isAlly = item.powerstats !== undefined
  const name = item?.name || 'Desconhecido'

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="modal-content w-full max-w-2xl max-h-96 overflow-y-auto">
              <div className="p-6 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-hud-glow font-mono">
                      {isAlly ? name.toUpperCase() : name}
                    </h2>
                    {isAlly && item.biography?.['full-name'] && (
                      <p className="text-sm text-hud-text font-mono mt-1">
                        {item.biography['full-name']}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={onClose}
                    className="text-hud-text hover:text-hud-highlight transition-colors text-xl"
                  >
                    ✕
                  </button>
                </div>

                {/* Content */}
                {isAlly ? (
                  <div className="space-y-4">
                    {/* Biography */}
                    {item.biography?.['alter-egos'] && (
                      <div className="text-sm space-y-1">
                        <p className="text-hud-text font-mono">
                          <span className="text-hud-highlight">ALTER EGO:</span> {item.biography['alter-egos']}
                        </p>
                        {item.biography['place-of-birth'] && (
                          <p className="text-hud-text font-mono">
                            <span className="text-hud-highlight">LOCAL DE NASCIMENTO:</span> {item.biography['place-of-birth']}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Work Base */}
                    {item.work?.['base'] && (
                      <div className="text-sm">
                        <p className="text-hud-text font-mono">
                          <span className="text-hud-highlight">BASE DE OPERAÇÕES:</span>
                        </p>
                        <p className="text-hud-text font-mono ml-4">{item.work['base']}</p>
                      </div>
                    )}

                    {/* Radar Chart */}
                    {item.powerstats && (
                      <div className="mt-4">
                        <RadarChart powerstats={item.powerstats} />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-hud-text font-mono">
                      <span className="text-hud-highlight">QUANTIDADE:</span> {item.quantity}
                    </p>
                    <p className="text-hud-text font-mono">
                      <span className="text-hud-highlight">CATEGORIA:</span> {item.category || 'EQUIPAMENTO'}
                    </p>
                    {item.description && (
                      <p className="text-hud-text font-mono text-sm mt-3">{item.description}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
