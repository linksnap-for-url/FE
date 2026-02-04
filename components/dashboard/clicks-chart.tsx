"use client"

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface ClicksChartProps {
  data: { hour: string; clicks: number }[]
}

export function ClicksChart({ data }: ClicksChartProps) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="oklch(0.45 0.15 250)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="oklch(0.45 0.15 250)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.02 250)" />
          <XAxis 
            dataKey="hour" 
            tick={{ fill: "oklch(0.45 0.04 250)", fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "oklch(0.88 0.02 250)" }}
          />
          <YAxis 
            tick={{ fill: "oklch(0.45 0.04 250)", fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "oklch(0.88 0.02 250)" }}
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
          />
          <Area 
            type="monotone" 
            dataKey="clicks" 
            stroke="oklch(0.45 0.15 250)" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorClicks)" 
            name="클릭"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
