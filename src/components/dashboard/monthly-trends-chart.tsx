"use client";

import type { MonthlyTrend } from "@/lib/types";
import { formatMonthLabel, formatCurrency } from "@/lib/format";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface MonthlyTrendsChartProps {
  trends: MonthlyTrend[];
}

export function MonthlyTrendsChart({ trends }: MonthlyTrendsChartProps) {
  const data = trends.map((t) => ({
    ...t,
    label: formatMonthLabel(t.month),
  }));

  return (
    <div className="space-y-6">
      {/* Earnings & Avg Price */}
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-2">Earnings &amp; Avg Price</p>
        <ResponsiveContainer width="100%" height={256}>
          <ComposedChart data={data} margin={{ top: 8, right: 32, left: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis
              yAxisId="earnings"
              orientation="left"
              tick={{ fontSize: 12 }}
              tickFormatter={(v) => formatCurrency(v)}
            />
            <YAxis
              yAxisId="price"
              orientation="right"
              tick={{ fontSize: 12 }}
              tickFormatter={(v) => formatCurrency(v)}
            />
            <Tooltip
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any, name: any) =>
                typeof value === "number" ? [formatCurrency(value as number), name] : ["-", name]
              }
            />
            <Legend />
            <Bar
              yAxisId="earnings"
              dataKey="earningsUSD"
              name="Earnings"
              fill="hsl(330, 85%, 70%)"
              radius={[3, 3, 0, 0]}
            />
            <Line
              yAxisId="price"
              type="monotone"
              dataKey="avgPriceUSD"
              name="Avg Price"
              stroke="hsl(210, 40%, 50%)"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Active Students & Lessons */}
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-2">Active Students &amp; Lessons</p>
        <ResponsiveContainer width="100%" height={256}>
          <ComposedChart data={data} margin={{ top: 8, right: 32, left: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="paidLessons"
              name="Paid Lessons"
              fill="hsl(330, 85%, 80%)"
              radius={[3, 3, 0, 0]}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="activeStudents"
              name="Active Students"
              stroke="hsl(170, 40%, 45%)"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
