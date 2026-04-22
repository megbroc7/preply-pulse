import { describe, it, expect } from "vitest";
import { computeRateTimeline, computeRateBuckets, computeRateHeadline } from "@/lib/rate-insights";
import type { RawLesson, StudentSummary, RateBucket } from "@/lib/types";

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
  it("reflects a rate change by the time the new rate dominates the 90-day window", () => {
    // Rate is $20 early, raised to $25 mid-February. 2nd-max requires >=2
    // new students at the new rate before it wins.
    const raw: RawLesson[] = [
      mkLesson({ student: "A", lessonDate: new Date(2025, 0, 10), type: "Non-trial lesson", lessonPriceUSD: 20 }),
      mkLesson({ student: "B", lessonDate: new Date(2025, 0, 20), type: "Non-trial lesson", lessonPriceUSD: 20 }),
      // Many new students at $25 in late Feb and March
      mkLesson({ student: "C", lessonDate: new Date(2025, 1, 15), type: "Non-trial lesson", lessonPriceUSD: 25 }),
      mkLesson({ student: "D", lessonDate: new Date(2025, 1, 20), type: "Non-trial lesson", lessonPriceUSD: 25 }),
      mkLesson({ student: "E", lessonDate: new Date(2025, 2, 5), type: "Non-trial lesson", lessonPriceUSD: 25 }),
      mkLesson({ student: "F", lessonDate: new Date(2025, 2, 15), type: "Non-trial lesson", lessonPriceUSD: 25 }),
    ];
    const students: StudentSummary[] = [
      mkStudent({ student: "A", paidLessons: 1 }),
      mkStudent({ student: "B", paidLessons: 1 }),
      mkStudent({ student: "C", paidLessons: 1 }),
      mkStudent({ student: "D", paidLessons: 1 }),
      mkStudent({ student: "E", paidLessons: 1 }),
      mkStudent({ student: "F", paidLessons: 1 }),
    ];
    const result = computeRateTimeline(raw, students);
    // Jan: only $20 new students exist → $20
    expect(result.find((p) => p.month === "2025-01")?.setRate).toBe(20);
    // March: 90-day window has [20, 20, 25, 25, 25, 25] → 2nd-highest = 25
    expect(result.find((p) => p.month === "2025-03")?.setRate).toBe(25);
  });

  it("ignores a one-off new-student block booking via 2nd-highest selection", () => {
    // Set rate $53. Three new students pay $53 for their first paid lesson,
    // one new student's first paid is a 2-hour block at $106. 2nd-max = $53.
    const raw: RawLesson[] = [
      mkLesson({ student: "A", lessonDate: new Date(2025, 0, 3), type: "Non-trial lesson", lessonPriceUSD: 53 }),
      mkLesson({ student: "B", lessonDate: new Date(2025, 0, 6), type: "Non-trial lesson", lessonPriceUSD: 53 }),
      mkLesson({ student: "C", lessonDate: new Date(2025, 0, 10), type: "Non-trial lesson", lessonPriceUSD: 53 }),
      mkLesson({ student: "D", lessonDate: new Date(2025, 0, 15), type: "Non-trial lesson", lessonPriceUSD: 106 }),
    ];
    const students: StudentSummary[] = [
      mkStudent({ student: "A", paidLessons: 1 }),
      mkStudent({ student: "B", paidLessons: 1 }),
      mkStudent({ student: "C", paidLessons: 1 }),
      mkStudent({ student: "D", paidLessons: 1 }),
    ];
    const result = computeRateTimeline(raw, students);
    expect(result[0].setRate).toBe(53);
  });

  it("is immune to legacy student rates (only looks at new students)", () => {
    // Student A joined Sep 2024 at $20 and still pays $20 in Jan 2025.
    // New student B joins Jan 2025 at $53. The set rate for Jan should be $53.
    const raw: RawLesson[] = [
      mkLesson({ student: "A", lessonDate: new Date(2024, 8, 10), type: "Non-trial lesson", lessonPriceUSD: 20 }),
      mkLesson({ student: "A", lessonDate: new Date(2025, 0, 5), type: "Non-trial lesson", lessonPriceUSD: 20 }),
      mkLesson({ student: "A", lessonDate: new Date(2025, 0, 12), type: "Non-trial lesson", lessonPriceUSD: 20 }),
      mkLesson({ student: "B", lessonDate: new Date(2025, 0, 15), type: "Non-trial lesson", lessonPriceUSD: 53 }),
    ];
    const students: StudentSummary[] = [
      mkStudent({ student: "A", paidLessons: 3 }),
      mkStudent({ student: "B", paidLessons: 1 }),
    ];
    const result = computeRateTimeline(raw, students);
    // Jan: A is not new (joined Sep 2024, outside 90d window from end of Jan),
    // so only B counts. Single value → 53.
    expect(result.find((p) => p.month === "2025-01")?.setRate).toBe(53);
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

  it("returns null setRate when no new students with paid lessons fall in the 90-day window", () => {
    // Trials-only month with no new students who took a paid lesson.
    const raw: RawLesson[] = [
      mkLesson({ student: "A", lessonDate: new Date(2025, 0, 5), type: "Trial" }),
    ];
    const students: StudentSummary[] = [mkStudent({ student: "A", trials: 1, paidLessons: 0 })];
    const result = computeRateTimeline(raw, students);
    expect(result[0].setRate).toBeNull();
    expect(result[0].paidLessonCount).toBe(0);
  });

  it("includes months with paid lessons but no trials", () => {
    const raw: RawLesson[] = [
      mkLesson({ student: "A", lessonDate: new Date(2025, 0, 5), type: "Trial" }),
      mkLesson({ student: "A", lessonDate: new Date(2025, 0, 10), type: "Non-trial lesson", lessonPriceUSD: 20 }),
      mkLesson({ student: "A", lessonDate: new Date(2025, 2, 5), type: "Non-trial lesson", lessonPriceUSD: 20 }),
    ];
    const students: StudentSummary[] = [mkStudent({ student: "A", trials: 1, paidLessons: 2 })];
    const result = computeRateTimeline(raw, students);
    expect(result.map((p) => p.month)).toEqual(["2025-01", "2025-03"]);
    // March: A joined Jan 5, which is within 90 days of end-of-March.
    expect(result[1].setRate).toBe(20);
    expect(result[1].trialCount).toBe(0);
  });

  it("returns empty array for empty input", () => {
    expect(computeRateTimeline([], [])).toEqual([]);
  });
});

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
