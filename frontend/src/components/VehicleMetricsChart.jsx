import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function VehicleMetricsChart({ allies }) {
  const chartData = [
    {
      name: 'Batman',
      availability: 95,
      readiness: allies?.[0]?.powerstats?.Speed || 0
    },
    {
      name: 'Flash',
      availability: 88,
      readiness: allies?.[1]?.powerstats?.Speed || 0
    },
    {
      name: 'Nightwing',
      availability: 92,
      readiness: allies?.[2]?.powerstats?.Speed || 0
    }
  ]

  const chartConfig = {
    backgroundColor: '#0A0A0A',
    border: '1px solid #2F2F2F',
    borderRadius: 0,
    color: '#E0E0E0',
    fontFamily: 'Courier New, monospace',
  }

  return (
    <div className="space-y-6">
      {/* Availability Chart */}
      <div className="hud-card">
        <h3 className="text-lg font-mono text-hud-glow mb-4">[DISPONIBILIDADE DOS VEÍCULOS]</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2F2F2F" />
            <XAxis dataKey="name" stroke="#E0E0E0" tick={{ fontFamily: 'Courier New, monospace' }} />
            <YAxis stroke="#E0E0E0" tick={{ fontFamily: 'Courier New, monospace' }} />
            <Tooltip
              contentStyle={chartConfig}
              formatter={(value) => `${value}%`}
            />
            <Legend wrapperStyle={{ color: '#E0E0E0', fontFamily: 'Courier New, monospace' }} />
            <Bar dataKey="availability" fill="#00AEEF" name="Disponibilidade %" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Readiness Chart */}
      <div className="hud-card">
        <h3 className="text-lg font-mono text-hud-glow mb-4">[PRONTIDÃO DE RESPOSTA]</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2F2F2F" />
            <XAxis dataKey="name" stroke="#E0E0E0" tick={{ fontFamily: 'Courier New, monospace' }} />
            <YAxis stroke="#E0E0E0" tick={{ fontFamily: 'Courier New, monospace' }} />
            <Tooltip contentStyle={chartConfig} />
            <Legend wrapperStyle={{ color: '#E0E0E0', fontFamily: 'Courier New, monospace' }} />
            <Line type="monotone" dataKey="readiness" stroke="#FFD700" name="Índice de Velocidade" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
