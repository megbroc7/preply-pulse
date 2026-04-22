"use client";

import type { RateTimelinePoint } from "@/lib/types";
import { formatCurrency, formatMonthLabel } from "@/lib/format";
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface RateConversionTimelineProps {
  timeline: RateTimelinePoint[];
}

export function RateConversionTimeline({ timeline }: RateConversionTimelineProps) {
  const data = timeline.map((p) => ({
    ...p,
    label: formatMonthLabel(p.month),
    conversionPct: p.trialConversionRate === null ? null : p.trialConversionRate * 100,
  }));

  return (
    <div className="space-y-2">
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={data} margin={{ top: 8, right: 32, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          <YAxis
            yAxisId="price"
            orientation="left"
            tick={{ fontSize: 12 }}
            tickFormatter={(v) => formatCurrency(v)}
          />
          <YAxis
            yAxisId="rate"
            orientation="right"
            domain={[0, 100]}
            tick={{ fontSize: 12 }}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any, name: any) => {
              if (value === null || value === undefined) return ["-", name];
              if (name === "Set rate") return [formatCurrency(value as number), name];
              if (name === "Trial conversion") return [`${(value as number).toFixed(0)}%`, name];
              return [value, name];
            }}
            labelFormatter={(label, payload) => {
              const p = payload?.[0]?.payload as
                | { trialCount?: number; paidLessonCount?: number }
                | undefined;
              if (!p) return label as string;
              return `${label} — trials: ${p.trialCount ?? 0}, paid lessons: ${p.paidLessonCount ?? 0}`;
            }}
          />
          <Legend />
          <Line
            yAxisId="price"
            type="monotone"
            dataKey="setRate"
            name="Set rate"
            stroke="hsl(210, 40%, 50%)"
            strokeWidth={2}
            dot={{ r: 3 }}
            connectNulls={false}
          />
          <Line
            yAxisId="rate"
            type="monotone"
            dataKey="conversionPct"
            name="Trial conversion"
            stroke="hsl(330, 85%, 60%)"
            strokeWidth={2}
            dot={{ r: 3 }}
            connectNulls={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
      <p className="text-xs text-muted-foreground">
        Set rate = what new students (first lesson within the last 90 days) were charged for their first paid lesson, taking the 2nd-highest to skip one-off block bookings. Months with fewer than 3 trials show no conversion point.
      </p>
    </div>
  );
}
