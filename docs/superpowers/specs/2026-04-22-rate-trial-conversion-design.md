# Trial Conversion by Rate — Design

**Status**: Draft, awaiting review
**Date**: 2026-04-22
**Owner**: Megan B.

## Motivation

A Reddit user asked whether PreplyPulse could track what a tutor charged over time and surface any connection between rate and trial conversion rate. The lessons CSV already contains per-lesson date, price, trial/non-trial flag, and student, so both questions can be answered from existing data without new ingestion.

This feature adds a new section to the Trials tab that shows:

1. A timeline of the tutor's de-facto "asking rate" alongside their trial conversion rate over time (the direct answer to "track what you charged over time").
2. A breakdown of trial conversion rate by the price charged for the trial (the direct answer to "is there a connection between rate and trial conversion").
3. A headline sentence summarising the cross-price conversion delta, with honest handling of small samples.

## Scope

**In scope**
- New section in `tab-trials.tsx` titled "Trial Conversion by Rate".
- New computation module `src/lib/rate-insights.ts`.
- Two new chart components and a headline card.
- Wiring into `ProcessedData`.
- Unit tests for the computation module.

**Out of scope**
- Linking the existing "Pricing is trending up/down" insight callout (compute-insights.ts:176-191) to the new chart. Can be added later.
- Extending to non-trial pricing or LTV-by-rate analysis (LTV intentionally dropped — the redditor asked about conversion, not LTV).
- Consolidating the existing `pricing-table` feature into a new Pricing tab. Revisit when there are 2-3 pricing features to justify the refactor.
- Component-level tests (matches existing project convention).

## Key Definitions

- **"Rate" on the timeline**: For each calendar month M, collect the first-paid-lesson price for every student whose first-ever lesson fell in the 90 days ending at the end of M; take the **second-highest** value (or the sole value if only one student). This is robust to the three sources of price variance a tutor cannot eliminate on Preply: (1) legacy rates — excluded because only *new* students (first lesson within 90 days) are considered; (2) 30-minute half-price first lessons — usually eclipsed by other new students at full rate within the rolling window; (3) multi-hour block bookings billed as one lesson at 2×/2.5× the hourly rate — skipped by taking the second-highest rather than the top value. Verified against a real tutor's rate-change history and the output matches their actual published rates within one step.
- **"Rate" in the bucket view**: The actual `lessonPriceUSD` charged for each trial lesson.
- **Trial conversion**: Student-level, matching existing codebase semantics (`process-data.ts:206`). A trial is "converted" iff its student has `paidLessons > 0`. A student with multiple trials contributes each trial separately to the bucket view, but all share the same conversion outcome.

## Architecture & File Changes

### New files

- `src/lib/rate-insights.ts` — all computation.
- `src/components/dashboard/rate-conversion-timeline.tsx` — dual-axis line chart.
- `src/components/dashboard/conversion-by-rate-chart.tsx` — bar chart with low-sample greying.
- `src/__tests__/rate-insights.test.ts` — unit tests.

### Modified files

- `src/lib/types.ts` — add new types; add `rateInsights: RateInsights` to `ProcessedData`.
- `src/lib/process-data.ts` — call `computeRateInsights(raw, students)` and attach result to `ProcessedData`.
- `src/components/dashboard/tab-trials.tsx` — render new section below the existing trial funnel.

## Types

Added to `src/lib/types.ts`:

```ts
export interface RateTimelinePoint {
  month: string;                       // "YYYY-MM"
  newStudentAvgPrice: number | null;   // null if no new students that month had a paid lesson
  trialConversionRate: number | null;  // null if trialCount < 3
  trialCount: number;
  newStudentCount: number;
}

export interface RateBucket {
  label: string;     // "$20" (discrete) or "$18–22" (quartile)
  minPrice: number;
  maxPrice: number;
  trials: number;
  conversions: number;
  conversionRate: number;
}

export interface RateHeadline {
  body: string;
  type: "info" | "success" | "warning";
}

export interface RateInsights {
  timeline: RateTimelinePoint[];
  buckets: RateBucket[];
  bucketMode: "discrete" | "quartile";
  headline: RateHeadline | null;
}
```

`ProcessedData` gains `rateInsights: RateInsights`.

## Computation

### `computeRateTimeline(raw, students)` → `RateTimelinePoint[]`

1. Build `convertedByStudent: Map<string, boolean>` from `students[].paidLessons > 0`.
2. Group `raw` lessons by month key (`YYYY-MM`).
3. For each month:
   - **New students this month**: students whose earliest lesson (trial or paid) falls in this month.
   - **`newStudentAvgPrice`**: among those new students, take the price of each one's first non-trial lesson (if any), then average. If none of them has a paid lesson yet, set `null`.
   - **`trialConversionRate`**: for trials in this month, look up each trial's student in `convertedByStudent`. Rate = `converted / trials`. If `trialCount < 3`, set `null`.
   - Record `trialCount` and `newStudentCount`.
4. Return sorted chronologically. Omit months with zero trials **and** zero new students.

### `computeRateBuckets(raw, students)` → `{ buckets, bucketMode }`

1. Filter `raw` to trials only. Build `convertedByStudent` as above.
2. Collect `distinctPrices = unique trial prices rounded to the nearest whole dollar`.
3. Bucket-mode decision:
   - `distinctPrices.length <= 6` → `mode = "discrete"`, one bucket per distinct price. Label `"$20"`.
   - Otherwise → `mode = "quartile"`, four buckets split at the 25th/50th/75th percentiles of observed trial prices. Label `"$18–22"`. If two adjacent percentile boundaries collide (e.g. heavy mass at one price), the resulting bucket is emitted empty; the UI renders it greyed with its "low sample" treatment.
4. For each bucket, aggregate `trials`, `conversions` (via `convertedByStudent` lookup per trial), and `conversionRate`. Keep low-sample buckets in output; the UI handles greying.

### `computeRateHeadline(buckets)` → `RateHeadline | null`

1. Filter to buckets with `trials >= 5`.
2. If fewer than 2 qualifying buckets remain → return `null`.
3. Take the lowest-priced and highest-priced qualifying buckets. If `|Δ conversionRate| < 0.05` (5 percentage points) → return `null`.
4. Otherwise build a sentence of the form:
   `"Your trials converted at {high}% at {priceA} and {low}% at {priceB} (n={nA}/{nB})."`
5. Type selection:
   - Higher price has lower conversion → `"warning"`.
   - Higher price has higher conversion → `"success"`.
   - Otherwise → `"info"`.

### `computeRateInsights(raw, students)`

Thin wrapper: calls the three functions above, returns `RateInsights`.

### Wire-up

In `process-data.ts`, after `students` is built and before the final return, compute `rateInsights` and attach to `ProcessedData`.

## Thresholds (via existing `ThresholdGate`)

- **Timeline**: render when `timeline.length >= 6`. Months where `trialConversionRate === null` gap the line (Recharts `connectNulls={false}`).
- **Bucket view**: render when there are `>= 2` non-empty buckets with at least `5` trials total across all buckets. Buckets with `trials < 3` rendered at `fillOpacity=0.3` with a "low sample" label.
- **Headline card**: always rendered inside the section. When `headline === null`, render the same card with a "not enough variation yet — keep using PreplyPulse to build up signal" message, type `"info"`.

## UI Composition

Inside `tab-trials.tsx`, below the existing `<TrialFunnelChart>`:

```
<section>
  <h2>Trial Conversion by Rate</h2>
  <RateHeadlineCard headline={rateInsights.headline} />
  <ThresholdGate met={timeline >= 6 months}>
    <RateConversionTimeline timeline={rateInsights.timeline} />
  </ThresholdGate>
  <ThresholdGate met={buckets valid}>
    <ConversionByRateChart insights={rateInsights} />
  </ThresholdGate>
</section>
```

### `<RateConversionTimeline />`

- Recharts `ComposedChart` in the style of `monthly-trends-chart.tsx`.
- Left Y-axis (`yAxisId="price"`): `newStudentAvgPrice` as `<Line>`, currency-formatted ticks.
- Right Y-axis (`yAxisId="rate"`): `trialConversionRate` as `<Line>`, percent-formatted ticks (0–100%).
- Both lines: `connectNulls={false}` so gap months leave breaks.
- Tooltip: month, rate, conversion %, `trialCount`, `newStudentCount`.
- Caption: "Rate = avg first-paid-lesson price for students who joined that month."

### `<ConversionByRateChart />`

- Recharts `BarChart`, one bar per bucket, X = bucket label, Y = conversion rate.
- Low-sample bars (`trials < 3`): `fillOpacity={0.3}`, "low sample" label.
- Bar labels show sample count (`"n=12"`).
- When `bucketMode === "quartile"`, subtle caption: "Grouped into quartiles (you've charged many different trial prices)."

### `<RateHeadlineCard />`

Wraps the existing `<InsightCallout>` component. Uses `headline.body` and `headline.type` directly, or a fixed "not enough variation yet" copy when `headline === null`.

## Testing

`src/__tests__/rate-insights.test.ts` using Vitest:

- **Timeline — rate change mid-stream**: 12 months of lessons with a rate increase at month 6. `newStudentAvgPrice` reflects the change.
- **Timeline — low-sample gap**: A month with 2 trials → `trialConversionRate === null`.
- **Timeline — no new paid students yet**: A month with new trial students but no paid lessons → `newStudentAvgPrice === null`.
- **Buckets — discrete**: 3 distinct trial prices → 3 buckets, correct trial/conversion counts.
- **Buckets — quartile**: 20+ distinct trial prices → 4 buckets; endpoints equal min/max.
- **Headline — insufficient variation**: Only 1 bucket with `>=5` trials → `null`.
- **Headline — delta below threshold**: Two qualifying buckets, conversion delta 3pp → `null`.
- **Headline — populated**: Two qualifying buckets, delta 12pp with higher price lower conversion → `type === "warning"` and body contains both prices and sample sizes.
- **Edge — zero trials**: empty timeline, empty buckets, `headline === null`.
- **Edge — all trials converted**: every qualifying bucket = 100%, headline `null` (delta is 0).

No component-level tests.

## Open Questions

None blocking. Two follow-ups noted for later:

- Should the "Pricing is trending up/down" insight in `compute-insights.ts` link/scroll to this new chart? (Punted — YAGNI.)
- Long-term: consolidate rate-related features into a dedicated "Pricing" tab. Revisit when there are 2-3 features.
