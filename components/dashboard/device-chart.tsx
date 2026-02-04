"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

interface DeviceChartProps {
  data: { name: string; value: number }[]
}

const COLORS = [
  "oklch(0.45 0.15 250)",
  "oklch(0.55 0.12 220)",
  "oklch(0.50 0.18 280)",
  "oklch(0.60 0.14 230)",
  "oklch(0.65 0.10 200)",
]

export function DeviceChart({ data }: DeviceChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "oklch(1 0 0)",
              border: "1px solid oklch(0.88 0.02 250)",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
            }}
            formatter={(value: number) => [
              `${value.toLocaleString()} (${((value / total) * 100).toFixed(1)}%)`,
              "클릭"
            ]}
          />
          <Legend 
            verticalAlign="bottom"
            formatter={(value) => <span style={{ color: "oklch(0.45 0.04 250)" }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
