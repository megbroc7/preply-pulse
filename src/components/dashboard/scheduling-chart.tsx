"use client";

import type { SchedulingStats } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface SchedulingChartProps {
  scheduling: SchedulingStats;
}

export function SchedulingChart({ scheduling }: SchedulingChartProps) {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-2">By Weekday</p>
        <ResponsiveContainer width="100%" height={192}>
          <BarChart
            data={scheduling.byWeekday}
            margin={{ top: 8, right: 40, left: 8, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="slot" tick={{ fontSize: 12 }} />
            <YAxis
              yAxisId="lessons"
              orientation="left"
              tick={{ fontSize: 12 }}
              allowDecimals={false}
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
                name === "Avg Price" ? [formatCurrency(value as number), name] : [value, name]
              }
            />
            <Legend />
            <Bar
              yAxisId="lessons"
              dataKey="paidLessons"
              name="Paid Lessons"
              fill="hsl(330, 85%, 70%)"
              radius={[3, 3, 0, 0]}
            />
            <Bar
              yAxisId="price"
              dataKey="avgPriceUSD"
              name="Avg Price"
              fill="hsl(210, 40%, 60%)"
              radius={[3, 3, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div>
        <p className="text-sm font-medium text-muted-foreground mb-2">By Time of Day</p>
        <ResponsiveContainer width="100%" height={192}>
          <BarChart
            data={scheduling.byTime}
            margin={{ top: 8, right: 40, left: 8, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="slot" tick={{ fontSize: 12 }} />
            <YAxis
              yAxisId="lessons"
              orientation="left"
              tick={{ fontSize: 12 }}
              allowDecimals={false}
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
                name === "Avg Price" ? [formatCurrency(value as number), name] : [value, name]
              }
            />
            <Legend />
            <Bar
              yAxisId="lessons"
              dataKey="paidLessons"
              name="Paid Lessons"
              fill="hsl(330, 85%, 70%)"
              radius={[3, 3, 0, 0]}
            />
            <Bar
              yAxisId="price"
              dataKey="avgPriceUSD"
              name="Avg Price"
              fill="hsl(210, 40%, 60%)"
              radius={[3, 3, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
