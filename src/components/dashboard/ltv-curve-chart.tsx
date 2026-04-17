"use client";

import type { LTVPoint } from "@/lib/types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const PINK = "hsl(330, 85%, 66%)";

interface LTVCurveChartProps {
  data: LTVPoint[];
}

export function LTVCurveChart({ data }: LTVCurveChartProps) {
  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 8, right: 24, left: 16, bottom: 24 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="lessonNumber"
            label={{
              value: "Lesson #",
              position: "insideBottom",
              offset: -8,
              style: { fontSize: 12 },
            }}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            tickFormatter={(v) => `$${v}`}
            tick={{ fontSize: 12 }}
            width={64}
            label={{
              value: "Avg Cumulative Earnings",
              angle: -90,
              position: "insideLeft",
              offset: -4,
              style: { fontSize: 11 },
            }}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              const point = payload[0]?.payload as LTVPoint;
              return (
                <div className="rounded-lg border bg-background p-3 shadow text-sm">
                  <p className="font-semibold mb-1">Lesson #{label}</p>
                  <p>Avg Cumulative Earnings: ${point.avgCumulativeEarnings.toFixed(2)}</p>
                  <p className="text-muted-foreground">Students at this point: {point.studentCount}</p>
                </div>
              );
            }}
          />
          <Line
            type="monotone"
            dataKey="avgCumulativeEarnings"
            stroke={PINK}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <p className="text-sm text-muted-foreground">
        This curve shows average cumulative earnings as students progress through lessons. The slope indicates how quickly earnings compound — a steep early curve suggests strong retention value per additional lesson.
      </p>
    </div>
  );
}
