import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export default function VehicleMetricsChart({ allies, inventory }) {
  // Status dos veículos baseado no inventário
  const vehicles = inventory?.filter(item => item.category === 'Vehicle') || []
  const vehiclesStatus = vehicles.map(v => ({
    name: v.name,
    status: v.quantity > 0 ? 'Disponível' : 'Indisponível',
    availability: v.quantity > 0 ? 100 : 0,
    quantity: v.quantity,
    icon: v.icon || '🚗'
  }))

  // Status de prontidão dos aliados
  const alliesStatus = allies?.map(a => ({
    name: a.name,
    readiness: Math.round((a.powerstats?.speed || 50) / 100 * 100), // Baseado na velocidade
    powerLevel: a.powerstats?.power || 50,
    status: a.powerstats?.speed > 70 ? 'Pronto' : a.powerstats?.speed > 40 ? 'Em espera' : 'Em manutenção'
  }))

  // Cores para status
  const STATUS_COLORS = {
    'Disponível': '#00FF00',
    'Indisponível': '#FF0000',
    'Pronto': '#00AEEF',
    'Em espera': '#FFD700',
    'Em manutenção': '#FF6347'
  }

  const chartConfig = {
    backgroundColor: '#0A0A0A',
    border: '1px solid #2F2F2F',
    borderRadius: 0,
    color: '#E0E0E0',
    fontFamily: 'Courier New, monospace',
  }

  return (
    <div className="space-y-6">
      {/* Cards de Status Rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="hud-card p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-hud-glow font-mono">🚗 FROTA DE VEÍCULOS</h4>
            <span className="text-2xl">{vehicles.length}</span>
          </div>
          <div className="text-sm text-hud-text">
            Disponíveis: <span className="text-green-400">{vehicles.filter(v => v.quantity > 0).length}</span> / {vehicles.length}
          </div>
        </div>

        <div className="hud-card p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-hud-glow font-mono">🦇 ALIADOS ATIVOS</h4>
            <span className="text-2xl">{allies?.length || 0}</span>
          </div>
          <div className="text-sm text-hud-text">
            Prontos para missão: <span className="text-hud-highlight">{alliesStatus.filter(a => a.status === 'Pronto').length}</span>
          </div>
        </div>

        <div className="hud-card p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-hud-glow font-mono">⚡ STATUS GERAL</h4>
            <span className="text-2xl text-green-400">OPERACIONAL</span>
          </div>
          <div className="text-sm text-hud-text">
            Sistema: <span className="text-green-400">100% funcional</span>
          </div>
        </div>
      </div>

      {/* Gráfico de Disponibilidade de Veículos */}
      <div className="hud-card">
        <h3 className="text-lg font-mono text-hud-glow mb-2">
          📊 DISPONIBILIDADE DA FROTA
          <span className="text-xs text-hud-text ml-2">(Veículos prontos para uso)</span>
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={vehiclesStatus}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2F2F2F" />
            <XAxis dataKey="name" stroke="#E0E0E0" tick={{ fontFamily: 'Courier New, monospace' }} />
            <YAxis stroke="#E0E0E0" tick={{ fontFamily: 'Courier New, monospace' }} />
            <Tooltip
              contentStyle={chartConfig}
              formatter={(value, name) => [
                `${name}: ${value}%`,
                `Quantidade: ${vehiclesStatus.find(v => v.name === name)?.quantity || 0}`
              ]}
            />
            <Legend wrapperStyle={{ color: '#E0E0E0', fontFamily: 'Courier New, monospace' }} />
            <Bar dataKey="availability" fill="#00AEEF" name="Disponibilidade %" />
          </BarChart>
        </ResponsiveContainer>
        <div className="text-xs text-hud-text mt-2">
          💡 <strong>Como funciona:</strong> Mostra quais veículos da Wayne Industries estão disponíveis para missões. 
          Veículos com quantidade > 0 estão 100% disponíveis.
        </div>
      </div>

      {/* Gráfico de Prontidão dos Aliados */}
      <div className="hud-card">
        <h3 className="text-lg font-mono text-hud-glow mb-2">
          🦸 PRONTIDÃO DOS ALIADOS
          <span className="text-xs text-hud-text ml-2">(Nível de preparação para missões)</span>
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={alliesStatus}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2F2F2F" />
            <XAxis dataKey="name" stroke="#E0E0E0" tick={{ fontFamily: 'Courier New, monospace' }} />
            <YAxis stroke="#E0E0E0" tick={{ fontFamily: 'Courier New, monospace' }} />
            <Tooltip
              contentStyle={chartConfig}
              formatter={(value, name) => [
                `${name}: ${value}%`,
                `Status: ${alliesStatus.find(a => a.name === name)?.status || 'Desconhecido'}`,
                `Nível de Poder: ${alliesStatus.find(a => a.name === name)?.powerLevel || 0}`
              ]}
            />
            <Legend wrapperStyle={{ color: '#E0E0E0', fontFamily: 'Courier New, monospace' }} />
            <Line type="monotone" dataKey="readiness" stroke="#FFD700" name="Prontidão %" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
        <div className="text-xs text-hud-text mt-2">
          💡 <strong>Como funciona:</strong> Baseado na velocidade de cada aliado. 
          Acima de 70% = Pronto para missão | 40-70% = Em espera | Abaixo de 40% = Em manutenção.
        </div>
      </div>

      {/* Status Detalhado */}
      <div className="hud-card">
        <h3 className="text-lg font-mono text-hud-glow mb-4">📋 STATUS DETALHADO</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-hud-text font-mono mb-2">Veículos</h4>
            <div className="space-y-1">
              {vehiclesStatus.map(v => (
                <div key={v.name} className="flex justify-between items-center p-2 bg-hud-dark/30 rounded">
                  <span className="text-sm">{v.icon} {v.name}</span>
                  <span className={`text-xs px-2 py-1 rounded`} style={{
                    backgroundColor: STATUS_COLORS[v.status] + '20',
                    color: STATUS_COLORS[v.status]
                  }}>
                    {v.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-hud-text font-mono mb-2">Aliados</h4>
            <div className="space-y-1">
              {alliesStatus.map(a => (
                <div key={a.name} className="flex justify-between items-center p-2 bg-hud-dark/30 rounded">
                  <span className="text-sm">{a.name}</span>
                  <span className={`text-xs px-2 py-1 rounded`} style={{
                    backgroundColor: STATUS_COLORS[a.status] + '20',
                    color: STATUS_COLORS[a.status]
                  }}>
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
