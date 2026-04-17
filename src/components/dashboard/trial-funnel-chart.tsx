"use client";

import type { TrialFunnelStats } from "@/lib/types";
import { formatPercent, formatNumber } from "@/lib/format";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const PINK = "hsl(330, 85%, 66%)";

interface TrialFunnelChartProps {
  funnel: TrialFunnelStats;
}

export function TrialFunnelChart({ funnel }: TrialFunnelChartProps) {
  const monthData = funnel.byMonth.map((m) => ({
    ...m,
    conversionPct: +(m.conversionRate * 100).toFixed(1),
  }));

  const weekdayData = funnel.byWeekday.map((d) => ({
    ...d,
    conversionPct: +(d.conversionRate * 100).toFixed(1),
  }));

  const timeData = funnel.byTime.map((d) => ({
    ...d,
    conversionPct: +(d.conversionRate * 100).toFixed(1),
  }));

  return (
    <div className="space-y-8">
      {/* Big numbers row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground mb-1">Total Trials</p>
          <p className="text-3xl font-bold">{formatNumber(funnel.totalTrials)}</p>
        </div>
        <div className="rounded-xl border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground mb-1">Conversion Rate</p>
          <p className="text-3xl font-bold" style={{ color: PINK }}>
            {formatPercent(funnel.conversionRate)}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground mb-1">Converted</p>
          <p className="text-3xl font-bold">{formatNumber(funnel.converted)}</p>
        </div>
      </div>

      {/* Conversion by Month */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
          Conversion by Month
        </h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={monthData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis
              tickFormatter={(v) => `${v}%`}
              tick={{ fontSize: 12 }}
              width={48}
            />
            <Tooltip
              formatter={(value) => [`${value}%`, "Conversion Rate"]}
            />
            <Bar dataKey="conversionPct" fill={PINK} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* By Weekday and By Time of Day side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
            By Weekday
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weekdayData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="slot" tick={{ fontSize: 11 }} />
              <YAxis
                tickFormatter={(v) => `${v}%`}
                tick={{ fontSize: 11 }}
                width={44}
              />
              <Tooltip
                formatter={(value) => [`${value}%`, "Conversion Rate"]}
              />
              <Bar dataKey="conversionPct" fill={PINK} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
            By Time of Day
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={timeData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="slot" tick={{ fontSize: 11 }} />
              <YAxis
                tickFormatter={(v) => `${v}%`}
                tick={{ fontSize: 11 }}
                width={44}
              />
              <Tooltip
                formatter={(value) => [`${value}%`, "Conversion Rate"]}
              />
              <Bar dataKey="conversionPct" fill={PINK} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
