import { describe, it, expect } from "vitest";
import { processData } from "@/lib/process-data";
import type { RawLesson } from "@/lib/types";

function makeLesson(overrides: Partial<RawLesson> = {}): RawLesson {
  return {
    serviceType: "Preply Marketplace",
    student: "Test Student",
    studentLocation: "United States",
    lessonDate: new Date(2025, 0, 15, 10, 0),
    dateConfirmed: new Date(2025, 0, 15, 11, 0),
    type: "Non-trial lesson",
    lessonPriceUSD: 40,
    tutorPayoutPercent: 72,
    earningUSD: 28.8,
    ...overrides,
  };
}

const SAMPLE_DATA: RawLesson[] = [
  makeLesson({ student: "Alice", lessonDate: new Date(2025, 0, 10, 10, 0), type: "Trial", lessonPriceUSD: 20, tutorPayoutPercent: null, earningUSD: null }),
  makeLesson({ student: "Alice", lessonDate: new Date(2025, 0, 12, 10, 0), type: "Non-trial lesson", lessonPriceUSD: 40, earningUSD: 28.8 }),
  makeLesson({ student: "Alice", lessonDate: new Date(2025, 0, 19, 10, 0), type: "Non-trial lesson", lessonPriceUSD: 40, earningUSD: 28.8 }),
  makeLesson({ student: "Bob", lessonDate: new Date(2025, 0, 11, 14, 0), type: "Trial", lessonPriceUSD: 20, tutorPayoutPercent: null, earningUSD: null }),
  makeLesson({ student: "Charlie", lessonDate: new Date(2025, 1, 5, 9, 0), type: "Trial", lessonPriceUSD: 20, tutorPayoutPercent: null, earningUSD: null }),
  makeLesson({ student: "Charlie", lessonDate: new Date(2025, 1, 6, 9, 0), type: "Non-trial lesson", lessonPriceUSD: 50, earningUSD: 36 }),
];

describe("processData", () => {
  it("counts total students correctly", () => {
    const result = processData(SAMPLE_DATA);
    expect(result.totalStudents).toBe(3);
  });

  it("separates trials from paid lessons", () => {
    const result = processData(SAMPLE_DATA);
    expect(result.totalTrials).toBe(3);
    expect(result.totalPaidLessons).toBe(3);
  });

  it("calculates total earnings from paid lessons only", () => {
    const result = processData(SAMPLE_DATA);
    expect(result.totalEarnings).toBeCloseTo(93.6);
  });

  it("builds student summaries with correct lesson counts", () => {
    const result = processData(SAMPLE_DATA);
    const alice = result.students.find((s) => s.student === "Alice");
    expect(alice).toBeDefined();
    expect(alice!.paidLessons).toBe(2);
    expect(alice!.trials).toBe(1);
  });

  it("calculates trial-to-first-paid gap", () => {
    const result = processData(SAMPLE_DATA);
    const alice = result.students.find((s) => s.student === "Alice");
    expect(alice!.trialToFirstPaidGapDays).toBe(2);
  });

  it("sets gap to null for non-converting trial students", () => {
    const result = processData(SAMPLE_DATA);
    const bob = result.students.find((s) => s.student === "Bob");
    expect(bob!.trialToFirstPaidGapDays).toBeNull();
  });

  it("builds monthly trends", () => {
    const result = processData(SAMPLE_DATA);
    expect(result.monthlyTrends.length).toBeGreaterThanOrEqual(2);
    const jan = result.monthlyTrends.find((m) => m.month === "2025-01");
    expect(jan).toBeDefined();
    expect(jan!.trials).toBe(2);
    expect(jan!.paidLessons).toBe(2);
  });

  it("builds trial funnel with conversion rate", () => {
    const result = processData(SAMPLE_DATA);
    expect(result.trialFunnel.totalTrials).toBe(3);
    expect(result.trialFunnel.converted).toBe(2);
    expect(result.trialFunnel.conversionRate).toBeCloseTo(0.6667, 3);
  });

  it("builds delay buckets", () => {
    const result = processData(SAMPLE_DATA);
    expect(result.trialFunnel.delayBuckets.length).toBeGreaterThan(0);
  });

  it("identifies reactivation candidates", () => {
    const result = processData(SAMPLE_DATA);
    expect(Array.isArray(result.reactivation)).toBe(true);
  });

  it("builds scheduling stats by weekday", () => {
    const result = processData(SAMPLE_DATA);
    expect(result.scheduling.byWeekday.length).toBe(7);
  });
});

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
