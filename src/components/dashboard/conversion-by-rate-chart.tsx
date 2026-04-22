"use client";

import type { RateInsights } from "@/lib/types";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";

interface ConversionByRateChartProps {
  insights: RateInsights;
}

const LOW_SAMPLE_THRESHOLD = 3;

export function ConversionByRateChart({ insights }: ConversionByRateChartProps) {
  const data = insights.buckets.map((b) => ({
    label: b.label,
    conversionPct: Math.round(b.conversionRate * 100),
    trials: b.trials,
    lowSample: b.trials < LOW_SAMPLE_THRESHOLD,
  }));

  return (
    <div className="space-y-2">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 16, right: 32, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 12 }}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any, _name: any, entry: any) => {
              const row = entry?.payload as { trials: number } | undefined;
              const n = row?.trials ?? 0;
              return [`${value}% (n=${n})`, "Trial conversion"];
            }}
          />
          <Bar dataKey="conversionPct" name="Trial conversion" radius={[3, 3, 0, 0]}>
            {data.map((d, i) => (
              <Cell
                key={i}
                fill="hsl(330, 85%, 70%)"
                fillOpacity={d.lowSample ? 0.3 : 1}
              />
            ))}
            <LabelList
              dataKey="trials"
              position="top"
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(v: any) => `n=${v}`}
              style={{ fontSize: 11 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {insights.bucketMode === "quartile" ? (
        <p className="text-xs text-muted-foreground">
          Grouped into quartiles (you've charged many different trial prices). Bars with fewer than 3 trials are greyed out.
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          Bars with fewer than 3 trials are greyed out.
        </p>
      )}
    </div>
  );
}
