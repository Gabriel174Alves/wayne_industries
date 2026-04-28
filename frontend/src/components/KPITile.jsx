import { motion } from 'framer-motion'

export default function KPITile({ title, value, unit = '', trend, icon = '📊' }) {
  const isPositive = trend > 0

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="hud-card p-4 flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-mono text-hud-glow">{title}</h3>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="space-y-1">
        <div className="text-3xl font-bold text-hud-highlight font-mono">
          {value} {unit}
        </div>
        <div className={`text-xs font-mono flex items-center gap-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          <span>{isPositive ? '↑' : '↓'}</span>
          <span>{Math.abs(trend)}%</span>
        </div>
      </div>
    </motion.div>
  )
}
