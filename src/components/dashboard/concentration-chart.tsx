"use client";

import { useMemo } from "react";
import type { StudentSummary } from "@/lib/types";
import { formatPercent, formatCurrency } from "@/lib/format";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const PINK = "hsl(330, 85%, 66%)";

interface ConcentrationChartProps {
  students: StudentSummary[];
  totalEarnings: number;
}

interface Segment {
  name: string;
  earnings: number;
  pct: number;
}

export function ConcentrationChart({
  students,
  totalEarnings,
}: ConcentrationChartProps) {
  const { segments, top5Pct } = useMemo(() => {
    const sorted = [...students].sort((a, b) => b.earningsUSD - a.earningsUSD);

    const top5 = sorted.slice(0, 5).reduce((s, x) => s + x.earningsUSD, 0);
    const top610 = sorted.slice(5, 10).reduce((s, x) => s + x.earningsUSD, 0);
    const rest = sorted.slice(10).reduce((s, x) => s + x.earningsUSD, 0);

    const safe = totalEarnings > 0 ? totalEarnings : 1;

    const segs: Segment[] = [
      { name: "Top 5", earnings: top5, pct: top5 / safe },
      { name: "Top 6–10", earnings: top610, pct: top610 / safe },
      { name: "Everyone Else", earnings: rest, pct: rest / safe },
    ];

    return { segments: segs, top5Pct: top5 / safe };
  }, [students, totalEarnings]);

  const showWarning = top5Pct > 0.5;

  return (
    <div className="space-y-4">
      {showWarning && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4">
          <p className="font-medium text-amber-900">
            High concentration risk
          </p>
          <p className="text-sm text-amber-800 mt-1 opacity-90">
            Your top 5 students account for {formatPercent(top5Pct)} of total
            earnings. Losing even one could significantly impact your income.
          </p>
        </div>
      )}

      <ResponsiveContainer width="100%" height={180}>
        <BarChart
          layout="vertical"
          data={segments}
          margin={{ top: 4, right: 40, bottom: 4, left: 90 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis
            type="number"
            tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`}
            domain={[0, 1]}
          />
          <YAxis type="category" dataKey="name" width={80} />
          <Tooltip
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any, _name: any, props: any) => {
              const pct = typeof value === "number" ? value : 0;
              const earnings: number = props?.payload?.earnings ?? 0;
              return [
                `${formatPercent(pct)} (${formatCurrency(earnings)})`,
                "Share of Earnings",
              ];
            }}
          />
          <Bar dataKey="pct" radius={[0, 4, 4, 0]}>
            {segments.map((_, i) => (
              <Cell key={i} fill={PINK} fillOpacity={1 - i * 0.2} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
