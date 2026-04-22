import { describe, it, expect } from "vitest";
import { checkThreshold } from "@/lib/thresholds";
import type { ProcessedData } from "@/lib/types";

function makeMinimalData(overrides: Partial<ProcessedData> = {}): ProcessedData {
  return {
    raw: [],
    students: [],
    monthlyTrends: [],
    trialFunnel: { totalTrials: 0, converted: 0, notConverted: 0, conversionRate: 0, byMonth: [], byWeekday: [], byTime: [], delayBuckets: [] },
    scheduling: { byWeekday: [], byTime: [] },
    reactivation: [],
    pricingOpportunities: [],
    seasonality: [],
    revenueForecast: { monthly: 0, day30Conservative: 0, day30Optimistic: 0, day60Conservative: 0, day60Optimistic: 0, day90Conservative: 0, day90Optimistic: 0, activeStudentCount: 0 },
    ltvCurve: [],
    insights: [],
    reportPeriod: { start: new Date(), end: new Date() },
    totalStudents: 0,
    totalLessons: 0,
    totalTrials: 0,
    totalPaidLessons: 0,
    totalGrossSales: 0,
    totalEarnings: 0,
    avgPaidLessonPrice: 0,
    avgEarningsPerPaidLesson: 0,
    medianPaidLessonsPerStudent: 0,
    studentsActiveIn30d: 0,
    studentsDormant180d: 0,
    ...overrides,
  } as ProcessedData;
}

describe("checkThreshold", () => {
  it("overview requires 30 paid lessons", () => {
    const notEnough = checkThreshold("overview", makeMinimalData({ totalPaidLessons: 20 }));
    expect(notEnough.met).toBe(false);
    const enough = checkThreshold("overview", makeMinimalData({ totalPaidLessons: 30 }));
    expect(enough.met).toBe(true);
  });

  it("trialFunnel requires 20 trials", () => {
    const notEnough = checkThreshold("trialFunnel", makeMinimalData({
      trialFunnel: { totalTrials: 15, converted: 0, notConverted: 0, conversionRate: 0, byMonth: [], byWeekday: [], byTime: [], delayBuckets: [] },
    }));
    expect(notEnough.met).toBe(false);
  });

  it("seasonality requires 6 months of data", () => {
    const trends = Array.from({ length: 5 }, (_, i) => ({
      month: `2025-0${i + 1}`,
      newStudents: 0, activeStudents: 0, trials: 0, paidLessons: 10,
      grossSalesUSD: 0, earningsUSD: 0, avgPriceUSD: 0, earningsPerActiveStudent: 0,
    }));
    const notEnough = checkThreshold("seasonality", makeMinimalData({ monthlyTrends: trends }));
    expect(notEnough.met).toBe(false);
  });
});

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
