import { describe, it, expect } from "vitest";
import { computeRateTimeline, computeRateBuckets } from "@/lib/rate-insights";
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
      mkLesson({ student: "A", lessonDate: new Date(2025, 0, 5), type: "Trial", lessonPriceUSD: 10 }),
      mkLesson({ student: "A", lessonDate: new Date(2025, 0, 10), type: "Non-trial lesson", lessonPriceUSD: 20 }),
      mkLesson({ student: "B", lessonDate: new Date(2025, 1, 5), type: "Trial", lessonPriceUSD: 10 }),
      mkLesson({ student: "B", lessonDate: new Date(2025, 1, 10), type: "Non-trial lesson", lessonPriceUSD: 20 }),
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
      mkLesson({ student: "A", lessonDate: new Date(2025, 0, 5), type: "Trial" }),
      mkLesson({ student: "A", lessonDate: new Date(2025, 0, 10), type: "Non-trial lesson", lessonPriceUSD: 20 }),
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
