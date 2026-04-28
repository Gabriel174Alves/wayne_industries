import { motion } from 'framer-motion'

export default function ItemCard({ item, onClick, isAlly = false }) {
  const name = item?.name || 'Desconhecido'
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="hud-card h-32 flex flex-col items-center justify-center cursor-pointer group"
      onClick={onClick}
    >
      {isAlly ? (
        // Ally Card
        <div className="w-full h-full flex flex-col items-center justify-center gap-2">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="w-16 h-16 object-cover rounded border border-hud-glow"
            />
          ) : (
            <div className="w-16 h-16 bg-hud-border flex items-center justify-center border border-hud-glow text-2xl">
              {name.charAt(0)}
            </div>
          )}
          <h3 className="text-xs font-mono text-hud-text text-center group-hover:text-hud-glow">
            {name.toUpperCase()}
          </h3>
          {item.powerstats?.Durability !== undefined && (
            <div className="w-full px-2">
              <div className="h-1 bg-hud-border relative overflow-hidden">
                <motion.div
                  className="h-full bg-hud-highlight"
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.powerstats.Durability / 100) * 100}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
              <span className="text-xs text-hud-text font-mono">
                DUR: {item.powerstats.Durability}%
              </span>
            </div>
          )}
        </div>
      ) : (
        // Equipment Card
        <div className="w-full h-full flex flex-col items-center justify-center gap-2">
          <div className="text-4xl">{item.icon || '📦'}</div>
          <h3 className="text-xs font-mono text-hud-text text-center group-hover:text-hud-glow">
            {name.toUpperCase()}
          </h3>
          <span className="text-lg font-bold text-hud-highlight font-mono">
            Qtd: {item.quantity || 0}
          </span>
        </div>
      )}
    </motion.div>
  )
}
