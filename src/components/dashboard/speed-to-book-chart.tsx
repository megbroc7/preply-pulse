"use client";

import type { DelayBucket } from "@/lib/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const PINK = "hsl(330, 85%, 66%)";
const SLATE_BLUE = "hsl(210, 40%, 60%)";

interface SpeedToBookChartProps {
  buckets: DelayBucket[];
}

export function SpeedToBookChart({ buckets }: SpeedToBookChartProps) {
  const data = buckets.filter((b) => b.students > 0);

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 8, right: 24, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="bucket" tick={{ fontSize: 12 }} />
          <YAxis
            yAxisId="left"
            orientation="left"
            tick={{ fontSize: 12 }}
            width={48}
            label={{
              value: "Avg Paid Lessons",
              angle: -90,
              position: "insideLeft",
              offset: 8,
              style: { fontSize: 11, fill: PINK },
            }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 12 }}
            width={64}
            tickFormatter={(v) => `$${v}`}
            label={{
              value: "Avg Lifetime Earnings",
              angle: 90,
              position: "insideRight",
              offset: 8,
              style: { fontSize: 11, fill: SLATE_BLUE },
            }}
          />
          <Tooltip
            formatter={(value, name) => {
              const num = typeof value === "number" ? value : Number(value);
              if (name === "avgPaidLessons") return [num.toFixed(1), "Avg Paid Lessons"];
              return [`$${num.toFixed(2)}`, "Avg Lifetime Earnings"];
            }}
          />
          <Legend
            formatter={(value) =>
              value === "avgPaidLessons" ? "Avg Paid Lessons" : "Avg Lifetime Earnings"
            }
          />
          <Bar yAxisId="left" dataKey="avgPaidLessons" fill={PINK} radius={[4, 4, 0, 0]} />
          <Bar
            yAxisId="right"
            dataKey="avgLifetimeEarnings"
            fill={SLATE_BLUE}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
      <p className="text-sm text-muted-foreground">
        Students who book their first paid lesson sooner after a trial tend to take more lessons and generate higher lifetime earnings. Use this chart to identify your optimal follow-up window.
      </p>
    </div>
  );
}
