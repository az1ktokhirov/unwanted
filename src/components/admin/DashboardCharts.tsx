"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface ChartPoint {
  date: string;
  visitors: number;
  views: number;
}

interface Props {
  data: ChartPoint[];
}

export function VisitorsChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="date" tick={{ fill: "#9CA3AF", fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "#9CA3AF", fontSize: 10 }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: "#1F2937", border: "1px solid #374151", borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: "#F9FAFB" }}
        />
        <Legend wrapperStyle={{ fontSize: 11, color: "#9CA3AF" }} />
        <Line type="monotone" dataKey="visitors" stroke="#E94560" strokeWidth={2} dot={false} name="Visitors" />
        <Line type="monotone" dataKey="views" stroke="#48BB78" strokeWidth={2} dot={false} name="Views" />
      </LineChart>
    </ResponsiveContainer>
  );
}
