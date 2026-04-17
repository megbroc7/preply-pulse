"use client";

import type { RevenueForecast } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface RevenueForecastChartProps {
  forecast: RevenueForecast;
}

export function RevenueForecastChart({ forecast }: RevenueForecastChartProps) {
  const {
    monthly,
    day30Conservative,
    day30Optimistic,
    day60Conservative,
    day60Optimistic,
    day90Conservative,
    day90Optimistic,
    activeStudentCount,
  } = forecast;

  // Projected is midpoint between conservative and optimistic
  const day30Projected = (day30Conservative + day30Optimistic) / 2;
  const day60Projected = (day60Conservative + day60Optimistic) / 2;
  const day90Projected = (day90Conservative + day90Optimistic) / 2;

  const chartData = [
    { label: "Now", optimistic: monthly, projected: monthly, conservative: monthly },
    { label: "30 days", optimistic: day30Optimistic, projected: day30Projected, conservative: day30Conservative },
    { label: "60 days", optimistic: day60Optimistic, projected: day60Projected, conservative: day60Conservative },
    { label: "90 days", optimistic: day90Optimistic, projected: day90Projected, conservative: day90Conservative },
  ];

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={256}>
        <AreaChart data={chartData} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="optimisticGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(330, 85%, 70%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(330, 85%, 70%)" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="projectedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(330, 70%, 60%)" stopOpacity={0.4} />
              <stop offset="95%" stopColor="hsl(330, 70%, 60%)" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="conservativeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(330, 40%, 80%)" stopOpacity={0.25} />
              <stop offset="95%" stopColor="hsl(330, 40%, 80%)" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => formatCurrency(v)} />
          <Tooltip
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any, name: any) =>
              typeof value === "number" ? [formatCurrency(value as number), name] : ["-", name]
            }
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="optimistic"
            name="Optimistic"
            stroke="hsl(330, 85%, 65%)"
            strokeWidth={1}
            fill="url(#optimisticGradient)"
          />
          <Area
            type="monotone"
            dataKey="projected"
            name="Projected"
            stroke="hsl(330, 70%, 55%)"
            strokeWidth={2}
            fill="url(#projectedGradient)"
          />
          <Area
            type="monotone"
            dataKey="conservative"
            name="Conservative"
            stroke="hsl(330, 40%, 75%)"
            strokeWidth={1}
            fill="url(#conservativeGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
      <p className="text-sm text-muted-foreground">
        Based on {activeStudentCount} currently active students and their recent lesson cadence.{" "}
        Projected monthly earnings: {formatCurrency(monthly)}.
      </p>
    </div>
  );
}
