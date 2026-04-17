"use client";

import type { ProcessedData } from "@/lib/types";
import { KPICard } from "./kpi-card";
import { InsightCallout } from "./insight-callout";
import { formatCurrency, formatCurrencyPrecise, formatPercent, formatNumber, formatDate } from "@/lib/format";

interface TabOverviewProps {
  data: ProcessedData;
}

export function TabOverview({ data }: TabOverviewProps) {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-muted-foreground mb-4">
          Report period: {formatDate(data.reportPeriod.start)} – {formatDate(data.reportPeriod.end)}
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <KPICard label="Total Students" value={formatNumber(data.totalStudents)} />
          <KPICard label="Total Lessons" value={formatNumber(data.totalLessons)} subtitle={`${formatNumber(data.totalPaidLessons)} paid`} />
          <KPICard label="Total Earnings" value={formatCurrency(data.totalEarnings)} subtitle={`${formatCurrency(data.totalGrossSales)} gross`} />
          <KPICard label="Avg Lesson Price" value={formatCurrencyPrecise(data.avgPaidLessonPrice)} />
          <KPICard label="Trial Conversion" value={formatPercent(data.trialFunnel.conversionRate)} subtitle={`${data.trialFunnel.converted} of ${data.trialFunnel.totalTrials}`} />
          <KPICard label="Active (30d)" value={formatNumber(data.studentsActiveIn30d)} subtitle={`${formatNumber(data.studentsDormant180d)} dormant 180d+`} />
        </div>
      </div>
      {data.insights.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold font-[family-name:var(--font-dm-sans)] mb-4">What stands out</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {data.insights.map((insight, i) => (
              <InsightCallout key={i} {...insight} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
