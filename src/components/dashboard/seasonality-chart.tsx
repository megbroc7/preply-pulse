"use client";

import type { SeasonalityPoint } from "@/lib/types";
import { formatMonthLabel } from "@/lib/format";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface SeasonalityChartProps {
  data: SeasonalityPoint[];
}

export function SeasonalityChart({ data }: SeasonalityChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    label: formatMonthLabel(d.month),
  }));

  return (
    <ResponsiveContainer width="100%" height={256}>
      <BarChart data={chartData} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
        <Tooltip
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(value: any) =>
            typeof value === "number"
              ? [`${(value * 100).toFixed(0)}% of average`, "Normalized Index"]
              : ["-", "Normalized Index"]
          }
        />
        <ReferenceLine
          y={1}
          stroke="hsl(215, 20%, 50%)"
          strokeDasharray="4 4"
          label={{ value: "Average", position: "right", fontSize: 11 }}
        />
        <Bar dataKey="normalizedIndex" name="Normalized Index" radius={[3, 3, 0, 0]}>
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.normalizedIndex >= 1 ? "hsl(330, 85%, 70%)" : "hsl(330, 30%, 80%)"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
