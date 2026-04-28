import React from 'react'
import { RadarChart as RechartsRadar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend, Tooltip } from 'recharts'

export default function RadarChart({ powerstats }) {
  const data = [
    {
      name: 'INT',
      value: Math.min(powerstats.Intelligence || 0, 100),
    },
    {
      name: 'STR',
      value: Math.min(powerstats.Strength || 0, 100),
    },
    {
      name: 'SPD',
      value: Math.min(powerstats.Speed || 0, 100),
    },
    {
      name: 'DUR',
      value: Math.min(powerstats.Durability || 0, 100),
    },
    {
      name: 'PWR',
      value: Math.min(powerstats.Power || 0, 100),
    },
    {
      name: 'CMB',
      value: Math.min(powerstats.Combat || 0, 100),
    },
  ]

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadar data={data} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
          <PolarGrid stroke="#2F2F2F" />
          <PolarAngleAxis dataKey="name" stroke="#00AEEF" tick={{ fill: '#E0E0E0', fontSize: 12 }} />
          <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#2F2F2F" tick={{ fill: '#E0E0E0', fontSize: 10 }} />
          <Radar name="Powerstats" dataKey="value" stroke="#00AEEF" fill="#00AEEF" fillOpacity={0.3} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0A0A0A',
              border: '1px solid #2F2F2F',
              borderRadius: 0,
              color: '#E0E0E0',
              fontFamily: 'Courier New, monospace',
            }}
            formatter={(value) => `${value}%`}
          />
          <Legend wrapperStyle={{ color: '#E0E0E0', fontFamily: 'Courier New, monospace' }} />
        </RechartsRadar>
      </ResponsiveContainer>
    </div>
  )
}
