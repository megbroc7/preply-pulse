import type {
  RawLesson,
  ProcessedData,
  StudentSummary,
  MonthlyTrend,
  TrialFunnelStats,
  TrialMonthStats,
  TrialSlotStats,
  DelayBucket,
  SchedulingStats,
  SchedulingSlot,
  ReactivationCandidate,
  PricingOpportunity,
} from "./types";

import {
  computeHealthScore,
  computeSeasonality,
  computeRevenueForecast,
  computeLTVCurve,
  generateInsights,
} from "./compute-insights";
import { computeRateInsights } from "./rate-insights";

// ─── Constants ──────────────────────────────────────────────────────────────

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const TIME_BUCKETS = ["Before 9", "9-12", "12-15", "15-18", "18-21", "21+"];

// ─── Utility helpers ─────────────────────────────────────────────────────────

function getTimeBucket(date: Date): string {
  const h = date.getHours();
  if (h < 9) return "Before 9";
  if (h < 12) return "9-12";
  if (h < 15) return "12-15";
  if (h < 18) return "15-18";
  if (h < 21) return "18-21";
  return "21+";
}

function getMonthKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function daysBetween(a: Date, b: Date): number {
  return Math.round(Math.abs(b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

// ─── Main export ─────────────────────────────────────────────────────────────

export function processData(lessons: RawLesson[]): ProcessedData {
  // Sort by date ascending
  const sorted = [...lessons].sort((a, b) => a.lessonDate.getTime() - b.lessonDate.getTime());

  const now = new Date();
  const ms90d = 90 * 24 * 60 * 60 * 1000;
  const ms30d = 30 * 24 * 60 * 60 * 1000;
  const ms180d = 180 * 24 * 60 * 60 * 1000;

  // ── Aggregate global paid prices for median ──────────────────────────────
  const allPaidPrices = sorted
    .filter((l) => l.type === "Non-trial lesson")
    .map((l) => l.lessonPriceUSD);
  const globalMedianPrice = median(allPaidPrices);

  // ── Build student summaries ──────────────────────────────────────────────
  const studentMap = new Map<string, RawLesson[]>();
  for (const lesson of sorted) {
    if (!studentMap.has(lesson.student)) studentMap.set(lesson.student, []);
    studentMap.get(lesson.student)!.push(lesson);
  }

  const students: StudentSummary[] = [];

  for (const [studentName, studentLessons] of studentMap) {
    const paid = studentLessons.filter((l) => l.type === "Non-trial lesson");
    const trials = studentLessons.filter((l) => l.type === "Trial");

    const firstLesson = studentLessons[0].lessonDate;
    const lastLesson = studentLessons[studentLessons.length - 1].lessonDate;

    const grossSalesUSD = studentLessons.reduce((s, l) => s + l.lessonPriceUSD, 0);
    const earningsUSD = paid.reduce((s, l) => s + (l.earningUSD ?? 0), 0);

    const avgPaidPriceUSD = paid.length > 0
      ? paid.reduce((s, l) => s + l.lessonPriceUSD, 0) / paid.length
      : 0;

    const lastPaidLesson = paid[paid.length - 1];
    const lastPaidPriceUSD = lastPaidLesson ? lastPaidLesson.lessonPriceUSD : 0;

    // Trial-to-first-paid gap
    let trialToFirstPaidGapDays: number | null = null;
    if (trials.length > 0 && paid.length > 0) {
      const firstTrial = trials[0].lessonDate;
      const firstPaid = paid[0].lessonDate;
      trialToFirstPaidGapDays = daysBetween(firstTrial, firstPaid);
    }

    // Days active / days since last
    const daysActive = daysBetween(firstLesson, lastLesson);
    const daysSinceLast = daysBetween(lastLesson, now);

    // Lessons per month over last 90 days
    const cutoff90d = new Date(now.getTime() - ms90d);
    const paidLast90d = paid.filter((l) => l.lessonDate.getTime() >= cutoff90d.getTime());
    const lessonsPerMonth90d = (paidLast90d.length / 90) * 30;

    // Health score
    const healthScore = computeHealthScore(
      daysSinceLast,
      lessonsPerMonth90d,
      avgPaidPriceUSD,
      globalMedianPrice
    );

    const activeIn30d = daysSinceLast <= 30;

    students.push({
      student: studentName,
      studentLocation: studentLessons[0].studentLocation,
      totalLessons: studentLessons.length,
      trials: trials.length,
      paidLessons: paid.length,
      grossSalesUSD,
      earningsUSD,
      firstLesson,
      lastLesson,
      daysActive,
      daysSinceLast,
      avgPaidPriceUSD,
      lastPaidPriceUSD,
      trialToFirstPaidGapDays,
      healthScore,
      activeIn30d,
    });
  }

  // ── Build monthly trends ─────────────────────────────────────────────────
  const monthMap = new Map<string, RawLesson[]>();
  for (const lesson of sorted) {
    const key = getMonthKey(lesson.lessonDate);
    if (!monthMap.has(key)) monthMap.set(key, []);
    monthMap.get(key)!.push(lesson);
  }

  // Track when each student was "new" (first lesson month)
  const studentFirstMonth = new Map<string, string>();
  for (const lesson of sorted) {
    if (!studentFirstMonth.has(lesson.student)) {
      studentFirstMonth.set(lesson.student, getMonthKey(lesson.lessonDate));
    }
  }

  const monthlyTrends: MonthlyTrend[] = [];
  const sortedMonthKeys = [...monthMap.keys()].sort();

  for (const monthKey of sortedMonthKeys) {
    const monthLessons = monthMap.get(monthKey)!;
    const paid = monthLessons.filter((l) => l.type === "Non-trial lesson");
    const trials = monthLessons.filter((l) => l.type === "Trial");

    const activeStudentSet = new Set(monthLessons.map((l) => l.student));
    const newStudentSet = new Set(
      [...activeStudentSet].filter((s) => studentFirstMonth.get(s) === monthKey)
    );

    const grossSalesUSD = monthLessons.reduce((s, l) => s + l.lessonPriceUSD, 0);
    const earningsUSD = paid.reduce((s, l) => s + (l.earningUSD ?? 0), 0);
    const avgPriceUSD = paid.length > 0
      ? paid.reduce((s, l) => s + l.lessonPriceUSD, 0) / paid.length
      : 0;

    const activeStudents = activeStudentSet.size;
    const earningsPerActiveStudent = activeStudents > 0 ? earningsUSD / activeStudents : 0;

    monthlyTrends.push({
      month: monthKey,
      newStudents: newStudentSet.size,
      activeStudents,
      trials: trials.length,
      paidLessons: paid.length,
      grossSalesUSD,
      earningsUSD,
      avgPriceUSD,
      earningsPerActiveStudent,
    });
  }

  // ── Build trial funnel ───────────────────────────────────────────────────
  // Students who had at least one trial
  const trialStudents = students.filter((s) => s.trials > 0);
  const convertedStudents = trialStudents.filter((s) => s.paidLessons > 0);
  const notConvertedStudents = trialStudents.filter((s) => s.paidLessons === 0);

  const totalTrials = sorted.filter((l) => l.type === "Trial").length;
  const converted = convertedStudents.length;
  const notConverted = notConvertedStudents.length;
  const conversionRate = trialStudents.length > 0 ? converted / trialStudents.length : 0;

  // By month
  const trialByMonthMap = new Map<string, { trials: RawLesson[]; studentNames: Set<string> }>();
  for (const lesson of sorted) {
    if (lesson.type !== "Trial") continue;
    const key = getMonthKey(lesson.lessonDate);
    if (!trialByMonthMap.has(key)) {
      trialByMonthMap.set(key, { trials: [], studentNames: new Set() });
    }
    const entry = trialByMonthMap.get(key)!;
    entry.trials.push(lesson);
    entry.studentNames.add(lesson.student);
  }

  const convertedStudentNames = new Set(convertedStudents.map((s) => s.student));
  const studentSummaryMap = new Map<string, StudentSummary>(students.map((s) => [s.student, s]));

  const byMonth: TrialMonthStats[] = [...trialByMonthMap.keys()].sort().map((monthKey) => {
    const { studentNames } = trialByMonthMap.get(monthKey)!;
    const monthTrialStudents = [...studentNames];
    const monthConverted = monthTrialStudents.filter((n) => convertedStudentNames.has(n)).length;
    const monthConversionRate = monthTrialStudents.length > 0 ? monthConverted / monthTrialStudents.length : 0;
    return {
      month: monthKey,
      trials: monthTrialStudents.length,
      conversionRate: monthConversionRate,
    };
  });

  // Helper to build slot stats from a grouping function
  function buildSlotStats(
    slots: string[],
    getLessonSlot: (l: RawLesson) => string
  ): TrialSlotStats[] {
    return slots.map((slot) => {
      const trialLessonsInSlot = sorted.filter(
        (l) => l.type === "Trial" && getLessonSlot(l) === slot
      );
      const studentNamesInSlot = new Set(trialLessonsInSlot.map((l) => l.student));
      const convertedInSlot = [...studentNamesInSlot].filter((n) => convertedStudentNames.has(n));

      const slotConversionRate = studentNamesInSlot.size > 0
        ? convertedInSlot.length / studentNamesInSlot.size
        : 0;

      const convertedSummaries = convertedInSlot
        .map((n) => studentSummaryMap.get(n))
        .filter((s): s is StudentSummary => s !== undefined);

      const ltvValues = convertedSummaries.map((s) => s.earningsUSD);
      const paidLessonCounts = convertedSummaries.map((s) => s.paidLessons);

      const avgLTV = ltvValues.length > 0
        ? ltvValues.reduce((a, b) => a + b, 0) / ltvValues.length
        : 0;
      const medianLTV = median(ltvValues);
      const avgPaidLessons = paidLessonCounts.length > 0
        ? paidLessonCounts.reduce((a, b) => a + b, 0) / paidLessonCounts.length
        : 0;

      return {
        slot,
        trials: studentNamesInSlot.size,
        conversionRate: slotConversionRate,
        avgLTV,
        medianLTV,
        avgPaidLessons,
      };
    });
  }

  const byWeekdayFunnel = buildSlotStats(WEEKDAYS, (l) => WEEKDAYS[l.lessonDate.getDay()]);
  const byTimeFunnel = buildSlotStats(TIME_BUCKETS, (l) => getTimeBucket(l.lessonDate));

  // Delay buckets: only for converted students with a trial
  const DELAY_BUCKET_DEFS: { bucket: string; min: number; max: number }[] = [
    { bucket: "≤1d", min: 0, max: 1 },
    { bucket: "1-3d", min: 2, max: 3 },
    { bucket: "3-7d", min: 4, max: 7 },
    { bucket: "7-14d", min: 8, max: 14 },
    { bucket: "14d+", min: 15, max: Infinity },
  ];

  const delayBuckets: DelayBucket[] = DELAY_BUCKET_DEFS.map(({ bucket, min, max }) => {
    const studentsInBucket = convertedStudents.filter((s) => {
      const gap = s.trialToFirstPaidGapDays;
      if (gap === null) return false;
      return gap >= min && gap <= max;
    });

    const paidCounts = studentsInBucket.map((s) => s.paidLessons);
    const earnings = studentsInBucket.map((s) => s.earningsUSD);

    return {
      bucket,
      students: studentsInBucket.length,
      avgPaidLessons: paidCounts.length > 0
        ? paidCounts.reduce((a, b) => a + b, 0) / paidCounts.length
        : 0,
      medianPaidLessons: median(paidCounts),
      avgLifetimeEarnings: earnings.length > 0
        ? earnings.reduce((a, b) => a + b, 0) / earnings.length
        : 0,
      medianLifetimeEarnings: median(earnings),
    };
  });

  const trialFunnel: TrialFunnelStats = {
    totalTrials,
    converted,
    notConverted,
    conversionRate,
    byMonth,
    byWeekday: byWeekdayFunnel,
    byTime: byTimeFunnel,
    delayBuckets,
  };

  // ── Build scheduling stats ───────────────────────────────────────────────
  function buildSchedulingSlots(
    slots: string[],
    getSlot: (l: RawLesson) => string
  ): SchedulingSlot[] {
    return slots.map((slot) => {
      const slotLessons = sorted.filter((l) => getSlot(l) === slot);
      const paid = slotLessons.filter((l) => l.type === "Non-trial lesson");
      const trials = slotLessons.filter((l) => l.type === "Trial");
      const activeStudents = new Set(slotLessons.map((l) => l.student)).size;
      const grossSalesUSD = slotLessons.reduce((s, l) => s + l.lessonPriceUSD, 0);
      const earningsUSD = paid.reduce((s, l) => s + (l.earningUSD ?? 0), 0);
      const avgPriceUSD = paid.length > 0
        ? paid.reduce((s, l) => s + l.lessonPriceUSD, 0) / paid.length
        : 0;

      return {
        slot,
        lessons: slotLessons.length,
        paidLessons: paid.length,
        trials: trials.length,
        activeStudents,
        grossSalesUSD,
        earningsUSD,
        avgPriceUSD,
      };
    });
  }

  const scheduling: SchedulingStats = {
    byWeekday: buildSchedulingSlots(WEEKDAYS, (l) => WEEKDAYS[l.lessonDate.getDay()]),
    byTime: buildSchedulingSlots(TIME_BUCKETS, (l) => getTimeBucket(l.lessonDate)),
  };

  // ── Reactivation candidates ──────────────────────────────────────────────
  // Students with 5+ paid lessons, 90+ days since last lesson
  const reactivation: ReactivationCandidate[] = students
    .filter((s) => s.paidLessons >= 5 && s.daysSinceLast >= 90)
    .sort((a, b) => b.earningsUSD - a.earningsUSD)
    .map((s) => ({
      student: s.student,
      studentLocation: s.studentLocation,
      paidLessons: s.paidLessons,
      earningsUSD: s.earningsUSD,
      lastLesson: s.lastLesson,
      daysSinceLast: s.daysSinceLast,
      lastPaidPriceUSD: s.lastPaidPriceUSD,
    }));

  // ── Pricing opportunities ────────────────────────────────────────────────
  // Active students (4+ paid lessons in last 90 days) below median price
  const cutoff90d = new Date(now.getTime() - ms90d);

  const pricingOpportunities: PricingOpportunity[] = students
    .filter((s) => {
      if (s.avgPaidPriceUSD >= globalMedianPrice) return false;
      const lessons90d = sorted.filter(
        (l) =>
          l.student === s.student &&
          l.type === "Non-trial lesson" &&
          l.lessonDate.getTime() >= cutoff90d.getTime()
      );
      return lessons90d.length >= 4;
    })
    .map((s) => {
      const lessons90dList = sorted.filter(
        (l) =>
          l.student === s.student &&
          l.type === "Non-trial lesson" &&
          l.lessonDate.getTime() >= cutoff90d.getTime()
      );
      const earnings90d = lessons90dList.reduce((sum, l) => sum + (l.earningUSD ?? 0), 0);
      const lessonsPerMonth = (lessons90dList.length / 90) * 30;

      return {
        student: s.student,
        studentLocation: s.studentLocation,
        paidLessons: s.paidLessons,
        lastPaidPriceUSD: s.lastPaidPriceUSD,
        lessons90d: lessons90dList.length,
        earnings90d,
        monthlyUplift5: lessonsPerMonth * 5,
        monthlyUplift10: lessonsPerMonth * 10,
      };
    })
    .sort((a, b) => b.monthlyUplift10 - a.monthlyUplift10);

  // ── Top-level aggregates ─────────────────────────────────────────────────
  const totalStudents = students.length;
  const totalLessons = sorted.length;
  const totalTrialCount = sorted.filter((l) => l.type === "Trial").length;
  const totalPaidLessons = sorted.filter((l) => l.type === "Non-trial lesson").length;
  const totalGrossSales = sorted.reduce((s, l) => s + l.lessonPriceUSD, 0);
  const totalEarnings = sorted.reduce((s, l) => s + (l.earningUSD ?? 0), 0);

  const paidLessonsAll = sorted.filter((l) => l.type === "Non-trial lesson");
  const avgPaidLessonPrice = paidLessonsAll.length > 0
    ? paidLessonsAll.reduce((s, l) => s + l.lessonPriceUSD, 0) / paidLessonsAll.length
    : 0;
  const avgEarningsPerPaidLesson = paidLessonsAll.length > 0
    ? paidLessonsAll.reduce((s, l) => s + (l.earningUSD ?? 0), 0) / paidLessonsAll.length
    : 0;

  const paidLessonsPerStudent = students.map((s) => s.paidLessons);
  const medianPaidLessonsPerStudent = median(paidLessonsPerStudent);

  const studentsActiveIn30d = students.filter((s) => s.daysSinceLast <= 30).length;
  const studentsDormant180d = students.filter((s) => s.daysSinceLast >= 180).length;

  const reportPeriod = {
    start: sorted.length > 0 ? sorted[0].lessonDate : now,
    end: sorted.length > 0 ? sorted[sorted.length - 1].lessonDate : now,
  };

  // ── Computed insights ────────────────────────────────────────────────────
  const seasonality = computeSeasonality(monthlyTrends);
  const revenueForecast = computeRevenueForecast(students, sorted, now);
  const ltvCurve = computeLTVCurve(sorted);
  const rateInsights = computeRateInsights(sorted, students);

  const insights = generateInsights({
    students,
    trialFunnel,
    monthlyTrends,
    totalEarnings,
    avgPaidLessonPrice,
    reactivation,
    pricingOpportunities,
    raw: sorted,
  });

  return {
    raw: sorted,
    students,
    monthlyTrends,
    trialFunnel,
    scheduling,
    reactivation,
    pricingOpportunities,
    seasonality,
    revenueForecast,
    ltvCurve,
    rateInsights,
    insights,
    reportPeriod,
    totalStudents,
    totalLessons,
    totalTrials: totalTrialCount,
    totalPaidLessons,
    totalGrossSales,
    totalEarnings,
    avgPaidLessonPrice,
    avgEarningsPerPaidLesson,
    medianPaidLessonsPerStudent,
    studentsActiveIn30d,
    studentsDormant180d,
  };
}
