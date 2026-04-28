import { useEffect } from 'react'
import { motion } from 'framer-motion'
import KPITile from '../components/KPITile'
import VehicleMetricsChart from '../components/VehicleMetricsChart'
import { useQuery } from '../hooks/useQuery'
import { useInventory } from '../context/InventoryContext'
import SummaryCards from '../components/SummaryCards'
import AlliesMonitor from '../components/AlliesMonitor'
import InventoryManager from '../components/InventoryManager'

export default function ControlTower({ token }) {
  const { state, setAllies } = useInventory()

  // Fetch allies for metrics
  const { loading } = useQuery('/api/allies', {
    token,
    onSuccess: (data) => setAllies(data)
  })

  // Fetch persisted inventory and logs for dashboard
  const { data: inventoryData, loading: invLoading, refetch: refetchInventory } = useQuery('/api/inventory', { token, onSuccess: (d) => setInventory(d) })
  const { data: logsData, loading: logsLoading } = useQuery('/api/logs', { token })

  const batman = state.allies?.[0]
  const flash = state.allies?.[1]
  const nightwing = state.allies?.[2]

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
              title="CAPACIDADE DE REDE"
              value={batman?.powerstats?.Intelligence || 0}
              unit="%"
              trend={5}
              icon="🧠"
            />
            <KPITile
              title="TEMPO DE RESPOSTA"
              value={flash?.powerstats?.Speed || 0}
              unit="ms"
              trend={-12}
              icon="⚡"
            />
            <KPITile
              title="DURABILIDADE DO SISTEMA"
              value={nightwing?.powerstats?.Durability || 0}
              unit="%"
              trend={3}
              icon="🛡️"
            />
          </div>

          {/* Allies Monitor */}
          <AlliesMonitor allies={state.allies || []} />

          {/* Charts */}
          <VehicleMetricsChart allies={state.allies} />

          {/* Inventory Manager (inline CRUD) */}
          <InventoryManager inventory={state.inventory || []} token={token} onRefresh={() => refetchInventory && refetchInventory()} />
        </div>
      )}
    </div>
  )
}
