"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface ResultPoint {
  label: string;
  scored: number;
  conceded: number;
}

interface FormData {
  wins: number;
  draws: number;
  losses: number;
}

export function ResultsLineChart({
  data,
  scoredLabel,
  concededLabel,
}: {
  data: ResultPoint[];
  scoredLabel: string;
  concededLabel: string;
}) {
  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-white/20 text-sm">
        Нет данных
      </div>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
        <XAxis dataKey="label" tick={{ fill: "#9ca3af", fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "#9ca3af", fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip
          contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: "#f9fafb" }}
        />
        <Legend
          wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
          formatter={(value) => <span style={{ color: "#9ca3af" }}>{value}</span>}
        />
        <Line
          type="monotone"
          dataKey="scored"
          name={scoredLabel}
          stroke="#e94560"
          strokeWidth={2}
          dot={{ r: 3, fill: "#e94560" }}
          activeDot={{ r: 5 }}
        />
        <Line
          type="monotone"
          dataKey="conceded"
          name={concededLabel}
          stroke="#4b5563"
          strokeWidth={2}
          dot={{ r: 3, fill: "#4b5563" }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function FormDonut({ data }: { data: FormData }) {
  const total = data.wins + data.draws + data.losses || 1;
  const chartData = [
    { name: "Победы", value: data.wins, color: "#48bb78" },
    { name: "Ничьи", value: data.draws, color: "#a0aec0" },
    { name: "Поражения", value: data.losses, color: "#e94560" },
  ].filter((d) => d.value > 0);

  const winPct = Math.round((data.wins / total) * 100);

  return (
    <div className="relative w-32 h-32 mx-auto">
      <PieChart width={128} height={128}>
        <Pie
          data={chartData}
          cx={60}
          cy={60}
          innerRadius={42}
          outerRadius={58}
          dataKey="value"
          strokeWidth={0}
        >
          {chartData.map((entry, index) => (
            <Cell key={index} fill={entry.color} />
          ))}
        </Pie>
      </PieChart>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-bebas text-2xl text-white leading-none">{winPct}%</span>
        <span className="text-white/40 text-[9px] uppercase tracking-wider">побед</span>
      </div>
    </div>
  );
}
