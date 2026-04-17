"use client";

import type { StudentSummary } from "@/lib/types";
import { formatCurrency, formatPercent } from "@/lib/format";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface GeographicChartProps {
  students: StudentSummary[];
  totalEarnings: number;
}

export function GeographicChart({ students, totalEarnings }: GeographicChartProps) {
  const byCountry = new Map<string, { earnings: number; count: number; paidLessons: number }>();

  for (const s of students) {
    if (s.earningsUSD === 0) continue;
    const entry = byCountry.get(s.studentLocation) || { earnings: 0, count: 0, paidLessons: 0 };
    entry.earnings += s.earningsUSD;
    entry.count++;
    entry.paidLessons += s.paidLessons;
    byCountry.set(s.studentLocation, entry);
  }

  const data = [...byCountry.entries()]
    .map(([country, stats]) => ({
      country,
      earnings: stats.earnings,
      students: stats.count,
      paidLessons: stats.paidLessons,
      pct: totalEarnings > 0 ? stats.earnings / totalEarnings : 0,
    }))
    .sort((a, b) => b.earnings - a.earnings)
    .slice(0, 10);

  return (
    <div className="space-y-4">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical">
            <XAxis type="number" tickFormatter={(v: number) => `$${v}`} fontSize={12} />
            <YAxis type="category" dataKey="country" width={130} fontSize={12} />
            <Tooltip
              formatter={(value: any, name: any) => {
                if (name === "earnings") return [formatCurrency(value), "Earnings"];
                return [value, name];
              }}
            />
            <Bar dataKey="earnings" fill="hsl(330, 85%, 66%)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center text-sm">
        {data.slice(0, 5).map((d) => (
          <div key={d.country} className="rounded-lg border border-gray-100 p-3">
            <p className="font-medium text-xs text-gray-500 truncate">{d.country}</p>
            <p className="font-semibold font-[family-name:var(--font-dm-sans)] mt-1">{formatCurrency(d.earnings)}</p>
            <p className="text-xs text-gray-400">{d.students} students · {formatPercent(d.pct)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
