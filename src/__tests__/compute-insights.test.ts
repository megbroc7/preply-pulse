import { describe, it, expect } from "vitest";
import {
  computeHealthScore,
  computeSeasonality,
  computeRevenueForecast,
  computeLTVCurve,
} from "@/lib/compute-insights";
import type { MonthlyTrend, StudentSummary, RawLesson } from "@/lib/types";

describe("computeHealthScore", () => {
  it("returns Healthy for recent, frequent, high-value student", () => {
    const score = computeHealthScore(5, 6, 50, 40);
    expect(score.label).toBe("Healthy");
    expect(score.composite).toBeGreaterThanOrEqual(0.7);
  });

  it("returns At Risk for moderately inactive student", () => {
    const score = computeHealthScore(30, 2.5, 35, 40);
    expect(score.label).toBe("At Risk");
  });

  it("returns Fading for long-inactive student", () => {
    const score = computeHealthScore(60, 0.5, 15, 40);
    expect(score.label).toBe("Fading");
    expect(score.composite).toBeLessThan(0.4);
  });
});

describe("computeSeasonality", () => {
  it("normalizes monthly lesson counts against average", () => {
    const trends: MonthlyTrend[] = [
      { month: "2025-01", paidLessons: 100, newStudents: 0, activeStudents: 0, trials: 0, grossSalesUSD: 0, earningsUSD: 0, avgPriceUSD: 0, earningsPerActiveStudent: 0 },
      { month: "2025-02", paidLessons: 50, newStudents: 0, activeStudents: 0, trials: 0, grossSalesUSD: 0, earningsUSD: 0, avgPriceUSD: 0, earningsPerActiveStudent: 0 },
      { month: "2025-03", paidLessons: 150, newStudents: 0, activeStudents: 0, trials: 0, grossSalesUSD: 0, earningsUSD: 0, avgPriceUSD: 0, earningsPerActiveStudent: 0 },
    ];
    const result = computeSeasonality(trends);
    expect(result).toHaveLength(3);
    expect(result[0].normalizedIndex).toBeCloseTo(1.0, 1);
    expect(result[1].normalizedIndex).toBeLessThan(1.0);
    expect(result[2].normalizedIndex).toBeGreaterThan(1.0);
  });
});

describe("computeLTVCurve", () => {
  it("computes cumulative earnings by lesson number", () => {
    const lessons: RawLesson[] = [
      { serviceType: "Preply Marketplace", student: "A", studentLocation: "US", lessonDate: new Date(2025, 0, 1), dateConfirmed: new Date(2025, 0, 1), type: "Non-trial lesson", lessonPriceUSD: 40, tutorPayoutPercent: 72, earningUSD: 28.8 },
      { serviceType: "Preply Marketplace", student: "A", studentLocation: "US", lessonDate: new Date(2025, 0, 8), dateConfirmed: new Date(2025, 0, 8), type: "Non-trial lesson", lessonPriceUSD: 40, tutorPayoutPercent: 72, earningUSD: 28.8 },
      { serviceType: "Preply Marketplace", student: "B", studentLocation: "UK", lessonDate: new Date(2025, 0, 2), dateConfirmed: new Date(2025, 0, 2), type: "Non-trial lesson", lessonPriceUSD: 50, tutorPayoutPercent: 72, earningUSD: 36 },
    ];
    const result = computeLTVCurve(lessons);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].lessonNumber).toBe(1);
    expect(result[0].studentCount).toBe(2);
    expect(result[0].avgCumulativeEarnings).toBeCloseTo(32.4, 1);
  });
});
