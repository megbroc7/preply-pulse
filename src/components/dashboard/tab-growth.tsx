"use client";

import type { ProcessedData } from "@/lib/types";
import { checkThreshold } from "@/lib/thresholds";
import { ThresholdGate } from "./threshold-gate";
import { MonthlyTrendsChart } from "./monthly-trends-chart";
import { SeasonalityChart } from "./seasonality-chart";
import { RevenueForecastChart } from "./revenue-forecast-chart";

interface TabGrowthProps { data: ProcessedData; }

export function TabGrowth({ data }: TabGrowthProps) {
  const trendsThreshold = checkThreshold("monthlyTrends", data);
  const seasonalityThreshold = checkThreshold("seasonality", data);
  const forecastThreshold = checkThreshold("revenueForecast", data);
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold font-[family-name:var(--font-dm-sans)] mb-4">Monthly Trends</h2>
        <ThresholdGate threshold={trendsThreshold}><MonthlyTrendsChart trends={data.monthlyTrends} /></ThresholdGate>
      </div>
      <div>
        <h2 className="text-lg font-semibold font-[family-name:var(--font-dm-sans)] mb-4">Seasonality</h2>
        <ThresholdGate threshold={seasonalityThreshold}><SeasonalityChart data={data.seasonality} /></ThresholdGate>
      </div>
      <div>
        <h2 className="text-lg font-semibold font-[family-name:var(--font-dm-sans)] mb-4">Revenue Forecast</h2>
        <ThresholdGate threshold={forecastThreshold}><RevenueForecastChart forecast={data.revenueForecast} /></ThresholdGate>
      </div>
    </div>
  );
}
