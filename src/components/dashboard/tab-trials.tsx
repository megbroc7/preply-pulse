"use client";

import type { ProcessedData } from "@/lib/types";
import { checkThreshold } from "@/lib/thresholds";
import { ThresholdGate } from "./threshold-gate";
import { TrialFunnelChart } from "./trial-funnel-chart";
import { SpeedToBookChart } from "./speed-to-book-chart";
import { LTVCurveChart } from "./ltv-curve-chart";
import { RateHeadlineCard } from "./rate-headline-card";
import { RateConversionTimeline } from "./rate-conversion-timeline";
import { ConversionByRateChart } from "./conversion-by-rate-chart";

interface TabTrialsProps { data: ProcessedData; }

export function TabTrials({ data }: TabTrialsProps) {
  const funnelThreshold = checkThreshold("trialFunnel", data);
  const speedThreshold = checkThreshold("speedToBook", data);
  const ltvThreshold = checkThreshold("ltvCurve", data);
  const rateConversionThreshold = checkThreshold("rateConversion", data);
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold font-[family-name:var(--font-dm-sans)] mb-4">Trial Funnel</h2>
        <ThresholdGate threshold={funnelThreshold}><TrialFunnelChart funnel={data.trialFunnel} /></ThresholdGate>
      </div>
      <div>
        <h2 className="text-lg font-semibold font-[family-name:var(--font-dm-sans)] mb-4">Speed to Book</h2>
        <ThresholdGate threshold={speedThreshold}><SpeedToBookChart buckets={data.trialFunnel.delayBuckets} /></ThresholdGate>
      </div>
      <div>
        <h2 className="text-lg font-semibold font-[family-name:var(--font-dm-sans)] mb-4">Trial Conversion by Rate</h2>
        <ThresholdGate threshold={rateConversionThreshold}>
          <div className="space-y-6">
            <RateHeadlineCard headline={data.rateInsights.headline} />
            <RateConversionTimeline timeline={data.rateInsights.timeline} />
            <ConversionByRateChart insights={data.rateInsights} />
          </div>
        </ThresholdGate>
      </div>
      <div>
        <h2 className="text-lg font-semibold font-[family-name:var(--font-dm-sans)] mb-4">Student Lifetime Value Curve</h2>
        <ThresholdGate threshold={ltvThreshold}><LTVCurveChart data={data.ltvCurve} /></ThresholdGate>
      </div>
    </div>
  );
}
