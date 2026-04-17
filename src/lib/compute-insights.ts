import type {
  HealthScore,
  MonthlyTrend,
  SeasonalityPoint,
  RevenueForecast,
  LTVPoint,
  StudentSummary,
  RawLesson,
  InsightCallout,
  TrialFunnelStats,
  ReactivationCandidate,
  PricingOpportunity,
} from "./types";

export function computeHealthScore(
  daysSinceLast: number,
  lessonsPerMonth90d: number,
  avgPrice: number,
  medianPrice: number
): HealthScore {
  let recency: number;
  if (daysSinceLast <= 14) recency = 1;
  else if (daysSinceLast <= 45) recency = 0.5;
  else recency = 0;

  let frequency: number;
  if (lessonsPerMonth90d >= 4) frequency = 1;
  else if (lessonsPerMonth90d >= 2) frequency = 0.5;
  else frequency = 0;

  let monetary: number;
  if (medianPrice === 0) {
    monetary = 0.5;
  } else if (avgPrice >= medianPrice) {
    monetary = 1;
  } else if (avgPrice >= medianPrice * 0.75) {
    monetary = 0.5;
  } else {
    monetary = 0;
  }

  const composite = recency * 0.4 + frequency * 0.35 + monetary * 0.25;

  let label: HealthScore["label"];
  if (composite >= 0.7) label = "Healthy";
  else if (composite >= 0.4) label = "At Risk";
  else label = "Fading";

  return { recency, frequency, monetary, composite, label };
}

export function computeSeasonality(monthlyTrends: MonthlyTrend[]): SeasonalityPoint[] {
  if (monthlyTrends.length === 0) return [];
  const avgLessons = monthlyTrends.reduce((sum, m) => sum + m.paidLessons, 0) / monthlyTrends.length;
  return monthlyTrends.map((m) => ({
    month: m.month,
    paidLessons: m.paidLessons,
    normalizedIndex: avgLessons > 0 ? m.paidLessons / avgLessons : 0,
  }));
}

export function computeRevenueForecast(
  students: StudentSummary[],
  lessons: RawLesson[],
  now: Date
): RevenueForecast {
  const activeStudents = students.filter((s) => s.activeIn30d);
  const last90d = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  let monthlyTotal = 0;
  for (const student of activeStudents) {
    const paidLast90d = lessons.filter(
      (l) => l.student === student.student && l.type === "Non-trial lesson" && l.lessonDate.getTime() >= last90d.getTime()
    );
    const lessonsPerMonth = (paidLast90d.length / 90) * 30;
    monthlyTotal += lessonsPerMonth * student.lastPaidPriceUSD;
  }

  return {
    monthly: monthlyTotal,
    day30Conservative: monthlyTotal * 0.8,
    day30Optimistic: monthlyTotal * 1.1,
    day60Conservative: monthlyTotal * 2 * 0.8,
    day60Optimistic: monthlyTotal * 2 * 1.1,
    day90Conservative: monthlyTotal * 3 * 0.8,
    day90Optimistic: monthlyTotal * 3 * 1.1,
    activeStudentCount: activeStudents.length,
  };
}

export function computeLTVCurve(lessons: RawLesson[]): LTVPoint[] {
  const paidByStudent = new Map<string, RawLesson[]>();
  for (const lesson of lessons) {
    if (lesson.type !== "Non-trial lesson") continue;
    if (!paidByStudent.has(lesson.student)) paidByStudent.set(lesson.student, []);
    paidByStudent.get(lesson.student)!.push(lesson);
  }
  for (const [, studentLessons] of paidByStudent) {
    studentLessons.sort((a, b) => a.lessonDate.getTime() - b.lessonDate.getTime());
  }
  const maxLessons = Math.max(0, ...[...paidByStudent.values()].map((l) => l.length));
  const points: LTVPoint[] = [];
  for (let i = 1; i <= maxLessons; i++) {
    const cumulativeEarnings: number[] = [];
    for (const [, studentLessons] of paidByStudent) {
      if (studentLessons.length >= i) {
        let cumulative = 0;
        for (let j = 0; j < i; j++) cumulative += studentLessons[j].earningUSD || 0;
        cumulativeEarnings.push(cumulative);
      }
    }
    if (cumulativeEarnings.length > 0) {
      points.push({
        lessonNumber: i,
        avgCumulativeEarnings: cumulativeEarnings.reduce((a, b) => a + b, 0) / cumulativeEarnings.length,
        studentCount: cumulativeEarnings.length,
      });
    }
  }
  return points;
}

export function generateInsights(data: {
  students: StudentSummary[];
  trialFunnel: TrialFunnelStats;
  monthlyTrends: MonthlyTrend[];
  totalEarnings: number;
  avgPaidLessonPrice: number;
  reactivation: ReactivationCandidate[];
  pricingOpportunities: PricingOpportunity[];
}): InsightCallout[] {
  const insights: InsightCallout[] = [];

  const convRate = data.trialFunnel.conversionRate;
  if (convRate >= 0.65) {
    insights.push({
      title: "Strong trial conversion",
      body: `Your trial-to-paid conversion is ${(convRate * 100).toFixed(1)}%. That's solid.`,
      type: "success",
    });
  } else if (convRate < 0.5) {
    insights.push({
      title: "Trial conversion needs attention",
      body: `Your trial-to-paid conversion is ${(convRate * 100).toFixed(1)}%. Look at what's different about trials that do convert.`,
      type: "warning",
    });
  }

  const fastBucket = data.trialFunnel.delayBuckets.find((b) => b.bucket === "1-3d");
  const slowBucket = data.trialFunnel.delayBuckets.find((b) => b.bucket === "14d+");
  if (fastBucket && slowBucket && fastBucket.students > 0 && slowBucket.students > 0) {
    const ratio = slowBucket.avgPaidLessons > 0 ? fastBucket.avgPaidLessons / slowBucket.avgPaidLessons : 0;
    if (ratio > 1.5) {
      insights.push({
        title: "Speed matters",
        body: `Students who book within 3 days of their trial average ${fastBucket.avgPaidLessons.toFixed(1)} paid lessons and $${fastBucket.avgLifetimeEarnings.toFixed(0)} lifetime earnings, versus ${slowBucket.avgPaidLessons.toFixed(1)} lessons and $${slowBucket.avgLifetimeEarnings.toFixed(0)} when they wait 14+ days.`,
        type: "info",
      });
    }
  }

  const sortedByEarnings = [...data.students].sort((a, b) => b.earningsUSD - a.earningsUSD);
  if (sortedByEarnings.length >= 10) {
    const top5Earnings = sortedByEarnings.slice(0, 5).reduce((s, st) => s + st.earningsUSD, 0);
    const top5Pct = (top5Earnings / data.totalEarnings) * 100;
    if (top5Pct > 40) {
      insights.push({
        title: "Revenue concentration",
        body: `Your top 5 students account for ${top5Pct.toFixed(1)}% of your earnings. Great students, but watch the concentration risk.`,
        type: top5Pct > 60 ? "warning" : "info",
      });
    }
  }

  if (data.monthlyTrends.length >= 3) {
    const recent = data.monthlyTrends.slice(-3);
    const earlier = data.monthlyTrends.slice(-6, -3);
    if (earlier.length >= 3) {
      const recentAvgPrice = recent.reduce((s, m) => s + m.avgPriceUSD, 0) / recent.length;
      const earlierAvgPrice = earlier.reduce((s, m) => s + m.avgPriceUSD, 0) / earlier.length;
      const priceChange = earlierAvgPrice > 0 ? ((recentAvgPrice - earlierAvgPrice) / earlierAvgPrice) * 100 : 0;
      if (Math.abs(priceChange) > 10) {
        insights.push({
          title: priceChange > 0 ? "Pricing is trending up" : "Pricing is trending down",
          body: `Your average lesson price ${priceChange > 0 ? "increased" : "decreased"} ${Math.abs(priceChange).toFixed(0)}% over the last 3 months compared to the prior 3.`,
          type: priceChange > 0 ? "success" : "warning",
        });
      }
    }
  }

  if (data.reactivation.length > 0) {
    const potentialEarnings = data.reactivation.slice(0, 10).reduce((s, r) => s + r.lastPaidPriceUSD * 4, 0);
    insights.push({
      title: "Reactivation opportunity",
      body: `You have ${data.reactivation.length} former students who took 5+ lessons and have gone quiet. If just the top 10 came back for 4 lessons each, that's ~$${potentialEarnings.toFixed(0)} in potential revenue.`,
      type: "info",
    });
  }

  if (data.pricingOpportunities.length > 0) {
    const totalUplift = data.pricingOpportunities.reduce((s, p) => s + p.monthlyUplift10, 0);
    insights.push({
      title: "Legacy pricing drag",
      body: `You have ${data.pricingOpportunities.length} active students on rates below your current median. A $10 increase across this group would add ~$${totalUplift.toFixed(0)}/month to your earnings.`,
      type: "info",
    });
  }

  return insights;
}
