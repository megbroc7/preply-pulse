# Trial Conversion by Rate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Trial Conversion by Rate" section to the Trials tab that plots tutor asking-rate alongside trial-conversion-rate over time, breaks conversion down by trial price, and surfaces a headline insight.

**Architecture:** Pure computation in a new `rate-insights.ts` module that takes the already-computed `raw` lessons and `students` summaries, so student-level conversion semantics match the rest of the codebase. Results flow into `ProcessedData.rateInsights` and are rendered by two Recharts components plus an `InsightCallout`-based headline card.

**Tech Stack:** TypeScript, Next.js App Router, Recharts (already a dependency), Vitest + jsdom (already configured).

**Spec:** `docs/superpowers/specs/2026-04-22-rate-trial-conversion-design.md`

---

## File Structure

**New files:**
- `src/lib/rate-insights.ts` — `computeRateTimeline`, `computeRateBuckets`, `computeRateHeadline`, `computeRateInsights`
- `src/__tests__/rate-insights.test.ts` — unit tests for the above
- `src/components/dashboard/rate-conversion-timeline.tsx` — dual-axis line chart
- `src/components/dashboard/conversion-by-rate-chart.tsx` — bar chart
- `src/components/dashboard/rate-headline-card.tsx` — thin wrapper over `InsightCallout`

**Modified files:**
- `src/lib/types.ts` — add new types; extend `ProcessedData`
- `src/lib/process-data.ts` — compute `rateInsights`, attach to return value
- `src/lib/thresholds.ts` — add `"rateConversion"` case
- `src/components/dashboard/tab-trials.tsx` — render the new section

---

## Task 1: Add types to `src/lib/types.ts`

**Files:**
- Modify: `src/lib/types.ts`

- [ ] **Step 1: Append new type definitions**

Add at the end of `src/lib/types.ts`, immediately before the existing `ThresholdResult` interface (keep `ThresholdResult` as the final export):

```ts
export interface RateTimelinePoint {
  month: string;
  newStudentAvgPrice: number | null;
  trialConversionRate: number | null;
  trialCount: number;
  newStudentCount: number;
}

export interface RateBucket {
  label: string;
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

- [ ] **Step 2: Extend `ProcessedData`**

Inside the existing `ProcessedData` interface, add one new field next to the other insight fields (after `ltvCurve: LTVPoint[];`):

```ts
  rateInsights: RateInsights;
```

- [ ] **Step 3: Verify types compile**

Run: `npx tsc --noEmit`
Expected: existing errors only about `rateInsights` being missing in `process-data.ts` return value; no new errors in `types.ts`. (If `tsc` reports zero errors for types.ts itself, good.)

- [ ] **Step 4: Commit**

```bash
git add src/lib/types.ts
git commit -m "feat(types): add RateInsights types for trial conversion by rate"
```

---

## Task 2: TDD `computeRateTimeline`

**Files:**
- Create: `src/lib/rate-insights.ts`
- Create: `src/__tests__/rate-insights.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/__tests__/rate-insights.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { computeRateTimeline } from "@/lib/rate-insights";
import type { RawLesson, StudentSummary } from "@/lib/types";

function mkLesson(overrides: Partial<RawLesson>): RawLesson {
  return {
    serviceType: "Preply Marketplace",
    student: "S1",
    studentLocation: "US",
    lessonDate: new Date(2025, 0, 1),
    dateConfirmed: new Date(2025, 0, 1),
    type: "Non-trial lesson",
    lessonPriceUSD: 25,
    tutorPayoutPercent: 72,
    earningUSD: 18,
    ...overrides,
  };
}

function mkStudent(overrides: Partial<StudentSummary>): StudentSummary {
  return {
    student: "S1",
    studentLocation: "US",
    totalLessons: 0,
    trials: 0,
    paidLessons: 0,
    grossSalesUSD: 0,
    earningsUSD: 0,
    firstLesson: new Date(2025, 0, 1),
    lastLesson: new Date(2025, 0, 1),
    daysActive: 0,
    daysSinceLast: 0,
    avgPaidPriceUSD: 0,
    lastPaidPriceUSD: 0,
    trialToFirstPaidGapDays: null,
    healthScore: { recency: 0, frequency: 0, monetary: 0, composite: 0, label: "Fading" },
    activeIn30d: false,
    ...overrides,
  };
}

describe("computeRateTimeline", () => {
  it("reflects a mid-stream rate change in newStudentAvgPrice", () => {
    const raw: RawLesson[] = [
      // Jan: new student A at $20
      mkLesson({ student: "A", lessonDate: new Date(2025, 0, 5), type: "Trial", lessonPriceUSD: 10 }),
      mkLesson({ student: "A", lessonDate: new Date(2025, 0, 10), type: "Non-trial lesson", lessonPriceUSD: 20 }),
      // Feb: new student B at $20
      mkLesson({ student: "B", lessonDate: new Date(2025, 1, 5), type: "Trial", lessonPriceUSD: 10 }),
      mkLesson({ student: "B", lessonDate: new Date(2025, 1, 10), type: "Non-trial lesson", lessonPriceUSD: 20 }),
      // Mar: new student C at $25
      mkLesson({ student: "C", lessonDate: new Date(2025, 2, 5), type: "Trial", lessonPriceUSD: 12 }),
      mkLesson({ student: "C", lessonDate: new Date(2025, 2, 10), type: "Non-trial lesson", lessonPriceUSD: 25 }),
    ];
    const students: StudentSummary[] = [
      mkStudent({ student: "A", paidLessons: 1, trials: 1 }),
      mkStudent({ student: "B", paidLessons: 1, trials: 1 }),
      mkStudent({ student: "C", paidLessons: 1, trials: 1 }),
    ];
    const result = computeRateTimeline(raw, students);
    const jan = result.find((p) => p.month === "2025-01");
    const mar = result.find((p) => p.month === "2025-03");
    expect(jan?.newStudentAvgPrice).toBe(20);
    expect(mar?.newStudentAvgPrice).toBe(25);
  });

  it("returns null trialConversionRate when trialCount < 3", () => {
    const raw: RawLesson[] = [
      mkLesson({ student: "A", lessonDate: new Date(2025, 0, 5), type: "Trial" }),
      mkLesson({ student: "B", lessonDate: new Date(2025, 0, 6), type: "Trial" }),
    ];
    const students: StudentSummary[] = [
      mkStudent({ student: "A", trials: 1, paidLessons: 0 }),
      mkStudent({ student: "B", trials: 1, paidLessons: 0 }),
    ];
    const result = computeRateTimeline(raw, students);
    const jan = result.find((p) => p.month === "2025-01");
    expect(jan?.trialCount).toBe(2);
    expect(jan?.trialConversionRate).toBeNull();
  });

  it("returns null newStudentAvgPrice when new students have no paid lessons yet", () => {
    const raw: RawLesson[] = [
      mkLesson({ student: "A", lessonDate: new Date(2025, 0, 5), type: "Trial" }),
    ];
    const students: StudentSummary[] = [mkStudent({ student: "A", trials: 1, paidLessons: 0 })];
    const result = computeRateTimeline(raw, students);
    expect(result[0].newStudentAvgPrice).toBeNull();
  });

  it("omits months with no trials and no new students", () => {
    const raw: RawLesson[] = [
      // Jan: new student A with a trial and paid
      mkLesson({ student: "A", lessonDate: new Date(2025, 0, 5), type: "Trial" }),
      mkLesson({ student: "A", lessonDate: new Date(2025, 0, 10), type: "Non-trial lesson", lessonPriceUSD: 20 }),
      // Mar: returning lesson for A, no new students, no trials
      mkLesson({ student: "A", lessonDate: new Date(2025, 2, 5), type: "Non-trial lesson", lessonPriceUSD: 20 }),
    ];
    const students: StudentSummary[] = [mkStudent({ student: "A", trials: 1, paidLessons: 2 })];
    const result = computeRateTimeline(raw, students);
    expect(result.map((p) => p.month)).toEqual(["2025-01"]);
  });

  it("returns empty array for empty input", () => {
    expect(computeRateTimeline([], [])).toEqual([]);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/__tests__/rate-insights.test.ts`
Expected: FAIL — `Cannot find module '@/lib/rate-insights'`.

- [ ] **Step 3: Write minimal implementation**

Create `src/lib/rate-insights.ts`:

```ts
import type { RawLesson, StudentSummary, RateTimelinePoint } from "./types";

function getMonthKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function buildConvertedMap(students: StudentSummary[]): Map<string, boolean> {
  return new Map(students.map((s) => [s.student, s.paidLessons > 0]));
}

export function computeRateTimeline(
  raw: RawLesson[],
  students: StudentSummary[]
): RateTimelinePoint[] {
  if (raw.length === 0) return [];

  const converted = buildConvertedMap(students);

  // First-ever-lesson date per student
  const firstLessonByStudent = new Map<string, Date>();
  for (const lesson of raw) {
    const existing = firstLessonByStudent.get(lesson.student);
    if (!existing || lesson.lessonDate.getTime() < existing.getTime()) {
      firstLessonByStudent.set(lesson.student, lesson.lessonDate);
    }
  }

  // First non-trial-lesson date + price per student
  const firstPaidByStudent = new Map<string, { date: Date; price: number }>();
  for (const lesson of raw) {
    if (lesson.type !== "Non-trial lesson") continue;
    const existing = firstPaidByStudent.get(lesson.student);
    if (!existing || lesson.lessonDate.getTime() < existing.date.getTime()) {
      firstPaidByStudent.set(lesson.student, {
        date: lesson.lessonDate,
        price: lesson.lessonPriceUSD,
      });
    }
  }

  // Group lessons by month
  const byMonth = new Map<string, RawLesson[]>();
  for (const lesson of raw) {
    const key = getMonthKey(lesson.lessonDate);
    if (!byMonth.has(key)) byMonth.set(key, []);
    byMonth.get(key)!.push(lesson);
  }

  const points: RateTimelinePoint[] = [];

  for (const monthKey of [...byMonth.keys()].sort()) {
    const monthLessons = byMonth.get(monthKey)!;
    const trials = monthLessons.filter((l) => l.type === "Trial");

    // New students = those whose first-ever lesson falls in this month
    const newStudents = new Set<string>();
    for (const lesson of monthLessons) {
      if (getMonthKey(firstLessonByStudent.get(lesson.student)!) === monthKey) {
        newStudents.add(lesson.student);
      }
    }

    // Omit months with no trials AND no new students
    if (trials.length === 0 && newStudents.size === 0) continue;

    // newStudentAvgPrice: average first-paid-lesson price across new students who have one
    const newStudentPrices: number[] = [];
    for (const s of newStudents) {
      const fp = firstPaidByStudent.get(s);
      if (fp) newStudentPrices.push(fp.price);
    }
    const newStudentAvgPrice =
      newStudentPrices.length > 0
        ? newStudentPrices.reduce((a, b) => a + b, 0) / newStudentPrices.length
        : null;

    // trialConversionRate: per-trial, using student-level converted flag
    let trialConversionRate: number | null = null;
    if (trials.length >= 3) {
      const convertedTrials = trials.filter((t) => converted.get(t.student) === true).length;
      trialConversionRate = convertedTrials / trials.length;
    }

    points.push({
      month: monthKey,
      newStudentAvgPrice,
      trialConversionRate,
      trialCount: trials.length,
      newStudentCount: newStudents.size,
    });
  }

  return points;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/__tests__/rate-insights.test.ts`
Expected: PASS (5/5).

- [ ] **Step 5: Commit**

```bash
git add src/lib/rate-insights.ts src/__tests__/rate-insights.test.ts
git commit -m "feat(rate-insights): add computeRateTimeline"
```

---

## Task 3: TDD `computeRateBuckets`

**Files:**
- Modify: `src/lib/rate-insights.ts`
- Modify: `src/__tests__/rate-insights.test.ts`

- [ ] **Step 1: Write the failing tests**

Append to `src/__tests__/rate-insights.test.ts`:

```ts
import { computeRateBuckets } from "@/lib/rate-insights";

describe("computeRateBuckets", () => {
  it("uses discrete mode for <=6 distinct trial prices", () => {
    const raw: RawLesson[] = [
      mkLesson({ student: "A", type: "Trial", lessonPriceUSD: 10 }),
      mkLesson({ student: "B", type: "Trial", lessonPriceUSD: 10 }),
      mkLesson({ student: "C", type: "Trial", lessonPriceUSD: 15 }),
      mkLesson({ student: "D", type: "Trial", lessonPriceUSD: 20 }),
    ];
    const students: StudentSummary[] = [
      mkStudent({ student: "A", trials: 1, paidLessons: 1 }),
      mkStudent({ student: "B", trials: 1, paidLessons: 0 }),
      mkStudent({ student: "C", trials: 1, paidLessons: 1 }),
      mkStudent({ student: "D", trials: 1, paidLessons: 0 }),
    ];
    const result = computeRateBuckets(raw, students);
    expect(result.bucketMode).toBe("discrete");
    expect(result.buckets).toHaveLength(3);
    const b10 = result.buckets.find((b) => b.minPrice === 10)!;
    expect(b10.trials).toBe(2);
    expect(b10.conversions).toBe(1);
    expect(b10.conversionRate).toBeCloseTo(0.5);
  });

  it("uses quartile mode for >6 distinct trial prices", () => {
    const prices = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
    const raw: RawLesson[] = prices.map((p, i) =>
      mkLesson({ student: `S${i}`, type: "Trial", lessonPriceUSD: p })
    );
    const students: StudentSummary[] = prices.map((_, i) =>
      mkStudent({ student: `S${i}`, trials: 1, paidLessons: i % 2 })
    );
    const result = computeRateBuckets(raw, students);
    expect(result.bucketMode).toBe("quartile");
    expect(result.buckets).toHaveLength(4);
    expect(result.buckets[0].minPrice).toBe(10);
    expect(result.buckets[3].maxPrice).toBe(20);
  });

  it("keeps low-sample buckets in output", () => {
    const raw: RawLesson[] = [
      mkLesson({ student: "A", type: "Trial", lessonPriceUSD: 10 }),
      mkLesson({ student: "B", type: "Trial", lessonPriceUSD: 20 }),
    ];
    const students: StudentSummary[] = [
      mkStudent({ student: "A", trials: 1, paidLessons: 1 }),
      mkStudent({ student: "B", trials: 1, paidLessons: 0 }),
    ];
    const result = computeRateBuckets(raw, students);
    expect(result.buckets).toHaveLength(2);
    expect(result.buckets.every((b) => b.trials === 1)).toBe(true);
  });

  it("rounds prices to nearest dollar when collecting distinct prices", () => {
    const raw: RawLesson[] = [
      mkLesson({ student: "A", type: "Trial", lessonPriceUSD: 19.8 }),
      mkLesson({ student: "B", type: "Trial", lessonPriceUSD: 20.2 }),
      mkLesson({ student: "C", type: "Trial", lessonPriceUSD: 20 }),
    ];
    const students: StudentSummary[] = [
      mkStudent({ student: "A", trials: 1, paidLessons: 1 }),
      mkStudent({ student: "B", trials: 1, paidLessons: 1 }),
      mkStudent({ student: "C", trials: 1, paidLessons: 0 }),
    ];
    const result = computeRateBuckets(raw, students);
    expect(result.bucketMode).toBe("discrete");
    expect(result.buckets).toHaveLength(1);
    expect(result.buckets[0].trials).toBe(3);
  });

  it("returns empty buckets for zero trials", () => {
    const result = computeRateBuckets([], []);
    expect(result.buckets).toEqual([]);
    expect(result.bucketMode).toBe("discrete");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/__tests__/rate-insights.test.ts -t computeRateBuckets`
Expected: FAIL — `computeRateBuckets is not defined` (import error).

- [ ] **Step 3: Add the implementation**

Append to `src/lib/rate-insights.ts`:

```ts
import type { RateBucket } from "./types";

function percentile(sortedValues: number[], p: number): number {
  if (sortedValues.length === 0) return 0;
  const idx = (sortedValues.length - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sortedValues[lo];
  return sortedValues[lo] * (hi - idx) + sortedValues[hi] * (idx - lo);
}

export function computeRateBuckets(
  raw: RawLesson[],
  students: StudentSummary[]
): { buckets: RateBucket[]; bucketMode: "discrete" | "quartile" } {
  const trials = raw.filter((l) => l.type === "Trial");
  if (trials.length === 0) {
    return { buckets: [], bucketMode: "discrete" };
  }

  const converted = buildConvertedMap(students);

  const roundedPrices = trials.map((t) => Math.round(t.lessonPriceUSD));
  const distinctPrices = [...new Set(roundedPrices)].sort((a, b) => a - b);

  if (distinctPrices.length <= 6) {
    const buckets: RateBucket[] = distinctPrices.map((price) => {
      const inBucket = trials.filter((t) => Math.round(t.lessonPriceUSD) === price);
      const conversions = inBucket.filter((t) => converted.get(t.student) === true).length;
      return {
        label: `$${price}`,
        minPrice: price,
        maxPrice: price,
        trials: inBucket.length,
        conversions,
        conversionRate: inBucket.length > 0 ? conversions / inBucket.length : 0,
      };
    });
    return { buckets, bucketMode: "discrete" };
  }

  // Quartile mode
  const sortedPrices = [...roundedPrices].sort((a, b) => a - b);
  const q1 = percentile(sortedPrices, 0.25);
  const q2 = percentile(sortedPrices, 0.5);
  const q3 = percentile(sortedPrices, 0.75);
  const min = sortedPrices[0];
  const max = sortedPrices[sortedPrices.length - 1];

  const edges: [number, number][] = [
    [min, q1],
    [q1, q2],
    [q2, q3],
    [q3, max],
  ];

  const buckets: RateBucket[] = edges.map(([lo, hi], i) => {
    const inBucket = trials.filter((t) => {
      const p = Math.round(t.lessonPriceUSD);
      if (i === 3) return p >= lo && p <= hi;
      return p >= lo && p < hi;
    });
    const conversions = inBucket.filter((t) => converted.get(t.student) === true).length;
    return {
      label: lo === hi ? `$${Math.round(lo)}` : `$${Math.round(lo)}–${Math.round(hi)}`,
      minPrice: lo,
      maxPrice: hi,
      trials: inBucket.length,
      conversions,
      conversionRate: inBucket.length > 0 ? conversions / inBucket.length : 0,
    };
  });

  return { buckets, bucketMode: "quartile" };
}
```

Note: the `import type { RateBucket } from "./types";` line should be merged into the existing type import at the top of the file, not added as a second import statement.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/__tests__/rate-insights.test.ts`
Expected: PASS (all tests, including previous `computeRateTimeline` tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/rate-insights.ts src/__tests__/rate-insights.test.ts
git commit -m "feat(rate-insights): add computeRateBuckets with discrete/quartile modes"
```

---

## Task 4: TDD `computeRateHeadline`

**Files:**
- Modify: `src/lib/rate-insights.ts`
- Modify: `src/__tests__/rate-insights.test.ts`

- [ ] **Step 1: Write the failing tests**

Append to `src/__tests__/rate-insights.test.ts`:

```ts
import { computeRateHeadline } from "@/lib/rate-insights";
import type { RateBucket } from "@/lib/types";

function mkBucket(o: Partial<RateBucket>): RateBucket {
  return {
    label: "$20",
    minPrice: 20,
    maxPrice: 20,
    trials: 10,
    conversions: 5,
    conversionRate: 0.5,
    ...o,
  };
}

describe("computeRateHeadline", () => {
  it("returns null when fewer than 2 qualifying buckets", () => {
    expect(computeRateHeadline([mkBucket({ trials: 10, conversionRate: 0.5 })])).toBeNull();
    expect(
      computeRateHeadline([
        mkBucket({ label: "$20", minPrice: 20, maxPrice: 20, trials: 10 }),
        mkBucket({ label: "$30", minPrice: 30, maxPrice: 30, trials: 3 }),
      ])
    ).toBeNull();
  });

  it("returns null when the delta is under 5 percentage points", () => {
    const buckets: RateBucket[] = [
      mkBucket({ label: "$20", minPrice: 20, maxPrice: 20, trials: 10, conversionRate: 0.5 }),
      mkBucket({ label: "$30", minPrice: 30, maxPrice: 30, trials: 10, conversionRate: 0.53 }),
    ];
    expect(computeRateHeadline(buckets)).toBeNull();
  });

  it('returns "warning" type when higher price has lower conversion', () => {
    const buckets: RateBucket[] = [
      mkBucket({ label: "$20", minPrice: 20, maxPrice: 20, trials: 10, conversions: 8, conversionRate: 0.8 }),
      mkBucket({ label: "$30", minPrice: 30, maxPrice: 30, trials: 10, conversions: 3, conversionRate: 0.3 }),
    ];
    const h = computeRateHeadline(buckets);
    expect(h?.type).toBe("warning");
    expect(h?.body).toContain("$20");
    expect(h?.body).toContain("$30");
    expect(h?.body).toContain("10");
  });

  it('returns "success" type when higher price has higher conversion', () => {
    const buckets: RateBucket[] = [
      mkBucket({ label: "$20", minPrice: 20, maxPrice: 20, trials: 10, conversions: 3, conversionRate: 0.3 }),
      mkBucket({ label: "$30", minPrice: 30, maxPrice: 30, trials: 10, conversions: 8, conversionRate: 0.8 }),
    ];
    const h = computeRateHeadline(buckets);
    expect(h?.type).toBe("success");
  });

  it("returns null when all qualifying buckets have identical conversion rates", () => {
    const buckets: RateBucket[] = [
      mkBucket({ label: "$20", minPrice: 20, maxPrice: 20, trials: 10, conversions: 10, conversionRate: 1 }),
      mkBucket({ label: "$30", minPrice: 30, maxPrice: 30, trials: 10, conversions: 10, conversionRate: 1 }),
    ];
    expect(computeRateHeadline(buckets)).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/__tests__/rate-insights.test.ts -t computeRateHeadline`
Expected: FAIL — `computeRateHeadline is not defined`.

- [ ] **Step 3: Add the implementation**

Append to `src/lib/rate-insights.ts`:

```ts
import type { RateHeadline } from "./types";

export function computeRateHeadline(buckets: RateBucket[]): RateHeadline | null {
  const qualifying = buckets.filter((b) => b.trials >= 5);
  if (qualifying.length < 2) return null;

  const byPrice = [...qualifying].sort((a, b) => a.minPrice - b.minPrice);
  const lowPriced = byPrice[0];
  const highPriced = byPrice[byPrice.length - 1];

  const delta = highPriced.conversionRate - lowPriced.conversionRate;
  if (Math.abs(delta) < 0.05) return null;

  const pct = (r: number) => `${Math.round(r * 100)}%`;
  const body =
    `Your trials converted at ${pct(highPriced.conversionRate)} at ${highPriced.label} ` +
    `and ${pct(lowPriced.conversionRate)} at ${lowPriced.label} ` +
    `(n=${highPriced.trials}/${lowPriced.trials}).`;

  const type: RateHeadline["type"] = delta < 0 ? "warning" : "success";

  return { body, type };
}
```

Note: merge `RateHeadline` into the existing `import type` statement at the top of the file.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/__tests__/rate-insights.test.ts`
Expected: PASS (all tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/rate-insights.ts src/__tests__/rate-insights.test.ts
git commit -m "feat(rate-insights): add computeRateHeadline"
```

---

## Task 5: Add `computeRateInsights` wrapper and wire into `ProcessedData`

**Files:**
- Modify: `src/lib/rate-insights.ts`
- Modify: `src/lib/process-data.ts`
- Modify: `src/__tests__/process-data.test.ts`

- [ ] **Step 1: Add the wrapper at the bottom of `rate-insights.ts`**

Append to `src/lib/rate-insights.ts`:

```ts
import type { RateInsights } from "./types";

export function computeRateInsights(
  raw: RawLesson[],
  students: StudentSummary[]
): RateInsights {
  const timeline = computeRateTimeline(raw, students);
  const { buckets, bucketMode } = computeRateBuckets(raw, students);
  const headline = computeRateHeadline(buckets);
  return { timeline, buckets, bucketMode, headline };
}
```

Merge `RateInsights` into the existing type imports.

- [ ] **Step 2: Add a failing test in `process-data.test.ts`**

Read the existing test file first to match its style, then append a new test inside an appropriate describe block (or add a new `describe("processData rateInsights", ...)`). Use the same fixture style as other tests in the file:

```ts
import { computeRateInsights } from "@/lib/rate-insights";

describe("processData rateInsights", () => {
  it("includes rateInsights on the returned ProcessedData", () => {
    const lessons: RawLesson[] = [
      { serviceType: "Preply Marketplace", student: "A", studentLocation: "US", lessonDate: new Date(2025, 0, 5), dateConfirmed: new Date(2025, 0, 5), type: "Trial", lessonPriceUSD: 10, tutorPayoutPercent: 72, earningUSD: 0 },
      { serviceType: "Preply Marketplace", student: "A", studentLocation: "US", lessonDate: new Date(2025, 0, 10), dateConfirmed: new Date(2025, 0, 10), type: "Non-trial lesson", lessonPriceUSD: 20, tutorPayoutPercent: 72, earningUSD: 14 },
    ];
    const result = processData(lessons);
    expect(result.rateInsights).toBeDefined();
    expect(Array.isArray(result.rateInsights.timeline)).toBe(true);
    expect(Array.isArray(result.rateInsights.buckets)).toBe(true);
    expect(["discrete", "quartile"]).toContain(result.rateInsights.bucketMode);
  });
});
```

Note: if `processData` and `RawLesson` are not already imported at the top of `process-data.test.ts`, add them.

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run src/__tests__/process-data.test.ts -t rateInsights`
Expected: FAIL — `result.rateInsights is undefined`.

- [ ] **Step 4: Wire `computeRateInsights` into `process-data.ts`**

At the top of `src/lib/process-data.ts`, add an import:

```ts
import { computeRateInsights } from "./rate-insights";
```

Right before the final `return { ... }` in `processData`, add:

```ts
  const rateInsights = computeRateInsights(sorted, students);
```

Inside the returned object, add the field next to the other insight fields (after `ltvCurve,`):

```ts
    rateInsights,
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run`
Expected: ALL PASS. If TypeScript complains in test files about missing `rateInsights`, fix by updating any fixture that builds a partial `ProcessedData` — otherwise leave alone.

- [ ] **Step 6: Commit**

```bash
git add src/lib/rate-insights.ts src/lib/process-data.ts src/__tests__/process-data.test.ts
git commit -m "feat(process-data): wire rateInsights into ProcessedData"
```

---

## Task 6: Add threshold case for the new section

**Files:**
- Modify: `src/lib/thresholds.ts`
- Modify: `src/__tests__/thresholds.test.ts`

- [ ] **Step 1: Write a failing test**

Append to `src/__tests__/thresholds.test.ts` (follow the existing test style in that file):

```ts
describe("checkThreshold rateConversion", () => {
  it("is not met when trials < 20", () => {
    const data = { trialFunnel: { totalTrials: 10 }, monthlyTrends: [] } as unknown as ProcessedData;
    const result = checkThreshold("rateConversion", data);
    expect(result.met).toBe(false);
  });

  it("is not met when monthlyTrends.length < 6", () => {
    const data = {
      trialFunnel: { totalTrials: 25 },
      monthlyTrends: new Array(3).fill({ month: "2025-01" }),
    } as unknown as ProcessedData;
    const result = checkThreshold("rateConversion", data);
    expect(result.met).toBe(false);
  });

  it("is met with >=20 trials and >=6 months", () => {
    const data = {
      trialFunnel: { totalTrials: 30 },
      monthlyTrends: new Array(6).fill({ month: "2025-01" }),
    } as unknown as ProcessedData;
    const result = checkThreshold("rateConversion", data);
    expect(result.met).toBe(true);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/__tests__/thresholds.test.ts -t rateConversion`
Expected: FAIL — defaults to `met: true` via the switch-default branch, so the "not met" assertions fail.

- [ ] **Step 3: Add the `"rateConversion"` case**

In `src/lib/thresholds.ts`, update the `ViewKey` union to include `"rateConversion"`:

```ts
type ViewKey =
  | "overview" | "studentSummary" | "scheduling"
  | "trialFunnel" | "speedToBook"
  | "monthlyTrends" | "concentrationRisk"
  | "healthScores" | "reactivation" | "pricing"
  | "ltvCurve" | "revenueForecast"
  | "seasonality"
  | "rateConversion";
```

Add a new case inside `checkThreshold` switch, before `default`:

```ts
    case "rateConversion":
      if (data.trialFunnel.totalTrials < 20 || monthCount(data) < 6) {
        return {
          met: false,
          message: `This view needs at least 20 trials and 6 months of data. You have ${data.trialFunnel.totalTrials} trials over ${monthCount(data)} months.`,
        };
      }
      return { met: true, message: "" };
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/__tests__/thresholds.test.ts`
Expected: ALL PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/thresholds.ts src/__tests__/thresholds.test.ts
git commit -m "feat(thresholds): add rateConversion threshold"
```

---

## Task 7: `<RateHeadlineCard>` component

**Files:**
- Create: `src/components/dashboard/rate-headline-card.tsx`

- [ ] **Step 1: Write the component**

Create `src/components/dashboard/rate-headline-card.tsx`:

```tsx
import type { RateHeadline } from "@/lib/types";
import { InsightCallout } from "./insight-callout";

interface RateHeadlineCardProps {
  headline: RateHeadline | null;
}

const EMPTY_STATE: { title: string; body: string } = {
  title: "Not enough variation yet",
  body: "Once you've charged a range of trial prices, we'll show whether rate moves conversion for you.",
};

export function RateHeadlineCard({ headline }: RateHeadlineCardProps) {
  if (headline === null) {
    return <InsightCallout title={EMPTY_STATE.title} body={EMPTY_STATE.body} type="info" />;
  }
  return <InsightCallout title="Rate vs trial conversion" body={headline.body} type={headline.type} />;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/rate-headline-card.tsx
git commit -m "feat(dashboard): add RateHeadlineCard component"
```

---

## Task 8: `<RateConversionTimeline>` component

**Files:**
- Create: `src/components/dashboard/rate-conversion-timeline.tsx`

- [ ] **Step 1: Write the component**

Create `src/components/dashboard/rate-conversion-timeline.tsx`:

```tsx
"use client";

import type { RateTimelinePoint } from "@/lib/types";
import { formatCurrency, formatMonthLabel } from "@/lib/format";
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface RateConversionTimelineProps {
  timeline: RateTimelinePoint[];
}

export function RateConversionTimeline({ timeline }: RateConversionTimelineProps) {
  const data = timeline.map((p) => ({
    ...p,
    label: formatMonthLabel(p.month),
    conversionPct: p.trialConversionRate === null ? null : p.trialConversionRate * 100,
  }));

  return (
    <div className="space-y-2">
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={data} margin={{ top: 8, right: 32, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          <YAxis
            yAxisId="price"
            orientation="left"
            tick={{ fontSize: 12 }}
            tickFormatter={(v) => formatCurrency(v)}
          />
          <YAxis
            yAxisId="rate"
            orientation="right"
            domain={[0, 100]}
            tick={{ fontSize: 12 }}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any, name: any) => {
              if (value === null || value === undefined) return ["-", name];
              if (name === "Asking rate") return [formatCurrency(value as number), name];
              if (name === "Trial conversion") return [`${(value as number).toFixed(0)}%`, name];
              return [value, name];
            }}
            labelFormatter={(label, payload) => {
              const p = payload?.[0]?.payload as
                | { trialCount?: number; newStudentCount?: number }
                | undefined;
              if (!p) return label as string;
              return `${label} — trials: ${p.trialCount ?? 0}, new students: ${p.newStudentCount ?? 0}`;
            }}
          />
          <Legend />
          <Line
            yAxisId="price"
            type="monotone"
            dataKey="newStudentAvgPrice"
            name="Asking rate"
            stroke="hsl(210, 40%, 50%)"
            strokeWidth={2}
            dot={{ r: 3 }}
            connectNulls={false}
          />
          <Line
            yAxisId="rate"
            type="monotone"
            dataKey="conversionPct"
            name="Trial conversion"
            stroke="hsl(330, 85%, 60%)"
            strokeWidth={2}
            dot={{ r: 3 }}
            connectNulls={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
      <p className="text-xs text-muted-foreground">
        Rate = avg first-paid-lesson price for students who joined that month. Months with fewer than 3 trials show no conversion point.
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Verify `formatCurrency` and `formatMonthLabel` exist in `format.ts`**

Run: `grep -n "formatCurrency\|formatMonthLabel" src/lib/format.ts`
Expected: both functions found.

If `formatMonthLabel` is not exported, inspect `src/lib/format.ts` and either export it or inline a small replacement in the component. (Based on usage in `monthly-trends-chart.tsx`, it is exported.)

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/dashboard/rate-conversion-timeline.tsx
git commit -m "feat(dashboard): add RateConversionTimeline component"
```

---

## Task 9: `<ConversionByRateChart>` component

**Files:**
- Create: `src/components/dashboard/conversion-by-rate-chart.tsx`

- [ ] **Step 1: Write the component**

Create `src/components/dashboard/conversion-by-rate-chart.tsx`:

```tsx
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
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/conversion-by-rate-chart.tsx
git commit -m "feat(dashboard): add ConversionByRateChart component"
```

---

## Task 10: Integrate new section into `tab-trials.tsx`

**Files:**
- Modify: `src/components/dashboard/tab-trials.tsx`

- [ ] **Step 1: Replace the file contents**

Overwrite `src/components/dashboard/tab-trials.tsx` with:

```tsx
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
```

- [ ] **Step 2: Run full test suite and typecheck**

Run: `npx vitest run && npx tsc --noEmit`
Expected: all tests pass, no TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/tab-trials.tsx
git commit -m "feat(dashboard): render Trial Conversion by Rate section in Trials tab"
```

---

## Task 11: Manual smoke test

**Files:** none (runtime verification)

- [ ] **Step 1: Start the dev server**

Run: `npm run dev`
Expected: server starts on http://localhost:3000.

- [ ] **Step 2: Load the dashboard with the mock dataset**

In the browser, navigate to the dashboard route (typically `/dashboard` — check `src/app/dashboard/` for the exact path) and use whatever mechanism loads `src/lib/mock-data.ts` (the landing page's "try with sample data" flow, if one exists).

- [ ] **Step 3: Verify the new section**

Click into the Trials tab and confirm:
- New "Trial Conversion by Rate" section is visible below "Speed to Book" and above "Student Lifetime Value Curve".
- Headline card renders (either with a real rate-vs-conversion sentence, or the "Not enough variation yet" fallback).
- Timeline chart renders with two lines (asking rate + trial conversion), and both axes have correct units ($ on left, % on right).
- Bucket bar chart renders with `n=…` labels.
- If the mock dataset has fewer than 20 trials or fewer than 6 months, confirm the ThresholdGate shows the "at least 20 trials and 6 months" message instead.

- [ ] **Step 4: Check the browser console**

Expected: no errors, no Recharts warnings about missing keys or undefined data.

- [ ] **Step 5: Run the full build**

Run: `npm run build`
Expected: build succeeds with no TypeScript errors.

- [ ] **Step 6: Commit any final fixes from smoke test**

If any bugs were found and fixed during the smoke test, commit them with a descriptive message. If nothing changed, skip this step.

```bash
git status
# If there are changes:
git add <files>
git commit -m "fix(dashboard): <describe smoke test fix>"
```

---

## Self-Review Notes

- **Spec coverage:** Timeline (Task 2), buckets (Task 3), headline (Task 4), wrapper + wire-up (Task 5), thresholds (Task 6), headline card (Task 7), timeline chart (Task 8), bucket chart (Task 9), tab integration (Task 10). All spec requirements mapped.
- **Types are consistent** across tasks: `RateTimelinePoint`, `RateBucket`, `RateHeadline`, `RateInsights` defined in Task 1 and referenced by the same names in every subsequent task.
- **Threshold choice:** single `"rateConversion"` gate with 20 trials + 6 months (mirrors the existing `trialFunnel` pattern). Within the gate, the bucket chart's low-sample greying and the headline card's null-state handle sub-threshold edge cases.
- **No placeholders remain**; every code step contains full code; every test step contains full tests.
