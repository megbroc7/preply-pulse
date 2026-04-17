"use client";

import type { ProcessedData } from "@/lib/types";
import { checkThreshold } from "@/lib/thresholds";
import { ThresholdGate } from "./threshold-gate";
import { ReactivationList } from "./reactivation-list";
import { PricingTable } from "./pricing-table";
import { SchedulingChart } from "./scheduling-chart";

interface TabActionsProps { data: ProcessedData; }

export function TabActions({ data }: TabActionsProps) {
  const reactivationThreshold = checkThreshold("reactivation", data);
  const pricingThreshold = checkThreshold("pricing", data);
  const schedulingThreshold = checkThreshold("scheduling", data);
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold font-[family-name:var(--font-dm-sans)] mb-4">Reactivation Opportunities</h2>
        <ThresholdGate threshold={reactivationThreshold}><ReactivationList candidates={data.reactivation} /></ThresholdGate>
      </div>
      <div>
        <h2 className="text-lg font-semibold font-[family-name:var(--font-dm-sans)] mb-4">Pricing Opportunities</h2>
        <ThresholdGate threshold={pricingThreshold}><PricingTable opportunities={data.pricingOpportunities} /></ThresholdGate>
      </div>
      <div>
        <h2 className="text-lg font-semibold font-[family-name:var(--font-dm-sans)] mb-4">Scheduling Patterns</h2>
        <ThresholdGate threshold={schedulingThreshold}><SchedulingChart scheduling={data.scheduling} /></ThresholdGate>
      </div>
    </div>
  );
}
