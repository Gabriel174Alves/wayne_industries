import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts'

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#00aef0', '#ff7f50', '#8dd1e1']

export default function MetricsCharts({ metrics }) {
  const byAlignment = Object.entries(metrics?.allies_by_alignment || {}).map(([k, v]) => ({ name: k, value: v }))
  const byPublisher = (metrics?.allies_by_publisher || []).map(p => ({ name: p.publisher, value: p.count }))
  const invByCategory = (metrics?.inventory_by_category || []).map(c => ({ name: c.category, value: c.count }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="hud-card p-4">
        <h3 className="text-lg font-mono text-hud-glow mb-2">Allies por Alignment</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={byAlignment}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2F2F2F" />
            <XAxis dataKey="name" stroke="#E0E0E0" />
            <YAxis stroke="#E0E0E0" />
            <Tooltip />
            <Bar dataKey="value" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="hud-card p-4">
        <h3 className="text-lg font-mono text-hud-glow mb-2">Allies por Publisher (top)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={byPublisher} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
              {byPublisher.map((entry, idx) => (
                <Cell key={`c-${idx}`} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Legend />
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="hud-card p-4">
        <h3 className="text-lg font-mono text-hud-glow mb-2">Inventário por Categoria</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={invByCategory}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2F2F2F" />
            <XAxis dataKey="name" stroke="#E0E0E0" />
            <YAxis stroke="#E0E0E0" />
            <Tooltip />
            <Bar dataKey="value" fill="#00aef0" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
