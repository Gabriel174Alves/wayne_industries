import { useEffect } from 'react'
import { motion } from 'framer-motion'
import KPITile from '../components/KPITile'
import VehicleMetricsChart from '../components/VehicleMetricsChart'
import MetricsCharts from '../components/MetricsCharts'
import { useQuery } from '../hooks/useQuery'
import { useInventory } from '../context/InventoryContext'
import SummaryCards from '../components/SummaryCards'
import AlliesMonitor from '../components/AlliesMonitor'
import InventoryManager from '../components/InventoryManager'

export default function ControlTower({ token }) {
  const { state, setAllies, setInventory } = useInventory()

  // Fetch aggregated metrics and set context state for allies/inventory
  const { data: metricsData, loading } = useQuery('/api/metrics', {
    token,
    onSuccess: (data) => {
      // prefer full lists if present, otherwise use recent arrays
      setAllies(data.allies || data.recent_allies || [])
      setInventory(data.inventory || data.recent_inventory || [])
    }
  })

  // Persisted logs
  const { data: logsData, loading: logsLoading } = useQuery('/api/logs', { token })

  const alliesCount = metricsData?.allies_count || (state.allies || []).length
  const inventoryTotal = metricsData?.inventory_total || (state.inventory || []).reduce((s, i) => s + (i.quantity || 0), 0)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold font-mono text-hud-glow mb-2">
          TORRE DE CONTROLE
        </h1>
        <p className="text-hud-text font-mono text-sm">
          [ANÁLISE DE CAPACIDADE E PRONTIDÃO DE RESPOSTA]
        </p>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center h-96">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-hud-glow font-mono text-xl"
          >
            [CARREGANDO MÉTRICAS...]
          </motion.div>
        </div>
      ) : (
        <div className="space-y-8">
          <SummaryCards allies={state.allies || []} inventory={state.inventory || []} logs={logsData || []} />
          {/* KPI Tiles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <KPITile
              title="TOTAL DE ALIADOS"
              value={alliesCount}
              unit=""
              trend={5}
              icon="🤝"
            />
            <KPITile
              title="TOTAL DE ITENS"
              value={inventoryTotal}
              unit=""
              trend={-2}
              icon="📦"
            />
            <KPITile
              title="EDITIONS RECENTES"
              value={(metricsData?.recent_allies?.length || 0) + (metricsData?.recent_inventory?.length || 0)}
              unit=""
              trend={3}
              icon="🕒"
            />
          </div>

          {/* Allies Monitor */}
          <AlliesMonitor allies={state.allies || []} />

          {/* Charts */}
          <VehicleMetricsChart allies={state.allies} inventory={state.inventory} />
          <MetricsCharts metrics={metricsData || {}} />

          {/* Inventory Manager (inline CRUD) */}
          <InventoryManager inventory={state.inventory || []} token={token} onRefresh={() => {
            // Recarregar dados do inventário
            fetch('/api/inventory', { headers: { Authorization: `Bearer ${token}` } })
              .then(res => res.json())
              .then(data => setInventory(data))
              .catch(err => console.error('Failed to refresh inventory:', err))
          }} />
        </div>
      )}
    </div>
  )
}
