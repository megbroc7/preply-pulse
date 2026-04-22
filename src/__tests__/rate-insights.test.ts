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
