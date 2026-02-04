"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"

interface ReferrerChartProps {
  data: { name: string; value: number }[]
}

const COLORS = [
  "oklch(0.45 0.15 250)",
  "oklch(0.55 0.12 220)",
  "oklch(0.50 0.18 280)",
  "oklch(0.60 0.14 230)",
  "oklch(0.65 0.10 200)",
  "oklch(0.55 0.08 250)",
]

export function ReferrerChart({ data }: ReferrerChartProps) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 10, right: 10, left: 60, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.02 250)" horizontal={true} vertical={false} />
          <XAxis 
            type="number"
            tick={{ fill: "oklch(0.45 0.04 250)", fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "oklch(0.88 0.02 250)" }}
          />
          <YAxis 
            type="category"
            dataKey="name"
            tick={{ fill: "oklch(0.45 0.04 250)", fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "oklch(0.88 0.02 250)" }}
            width={55}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "oklch(1 0 0)",
              border: "1px solid oklch(0.88 0.02 250)",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
            }}
            labelStyle={{ color: "oklch(0.15 0.03 250)", fontWeight: 600 }}
            itemStyle={{ color: "oklch(0.45 0.04 250)" }}
            formatter={(value: number) => [value.toLocaleString(), "클릭"]}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
