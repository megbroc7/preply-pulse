export interface RawLesson {
  serviceType: string;
  student: string;
  studentLocation: string;
  lessonDate: Date;
  dateConfirmed: Date;
  type: "Trial" | "Non-trial lesson";
  lessonPriceUSD: number;
  tutorPayoutPercent: number | null;
  earningUSD: number | null;
}

export interface StudentSummary {
  student: string;
  studentLocation: string;
  totalLessons: number;
  trials: number;
  paidLessons: number;
  grossSalesUSD: number;
  earningsUSD: number;
  firstLesson: Date;
  lastLesson: Date;
  daysActive: number;
  daysSinceLast: number;
  avgPaidPriceUSD: number;
  lastPaidPriceUSD: number;
  trialToFirstPaidGapDays: number | null;
  healthScore: HealthScore;
  activeIn30d: boolean;
}

export interface HealthScore {
  recency: number;
  frequency: number;
  monetary: number;
  composite: number;
  label: "Healthy" | "At Risk" | "Fading";
}

export interface MonthlyTrend {
  month: string;
  newStudents: number;
  activeStudents: number;
  trials: number;
  paidLessons: number;
  grossSalesUSD: number;
  earningsUSD: number;
  avgPriceUSD: number;
  earningsPerActiveStudent: number;
}

export interface TrialFunnelStats {
  totalTrials: number;
  converted: number;
  notConverted: number;
  conversionRate: number;
  byMonth: TrialMonthStats[];
  byWeekday: TrialSlotStats[];
  byTime: TrialSlotStats[];
  delayBuckets: DelayBucket[];
}

export interface TrialMonthStats {
  month: string;
  trials: number;
  conversionRate: number;
}

export interface TrialSlotStats {
  slot: string;
  trials: number;
  conversionRate: number;
  avgLTV: number;
  medianLTV: number;
  avgPaidLessons: number;
}

export interface DelayBucket {
  bucket: string;
  students: number;
  avgPaidLessons: number;
  medianPaidLessons: number;
  avgLifetimeEarnings: number;
  medianLifetimeEarnings: number;
}

export interface SchedulingStats {
  byWeekday: SchedulingSlot[];
  byTime: SchedulingSlot[];
}

export interface SchedulingSlot {
  slot: string;
  lessons: number;
  paidLessons: number;
  trials: number;
  activeStudents: number;
  grossSalesUSD: number;
  earningsUSD: number;
  avgPriceUSD: number;
}

export interface ReactivationCandidate {
  student: string;
  studentLocation: string;
  paidLessons: number;
  earningsUSD: number;
  lastLesson: Date;
  daysSinceLast: number;
  lastPaidPriceUSD: number;
}

export interface PricingOpportunity {
  student: string;
  studentLocation: string;
  paidLessons: number;
  lastPaidPriceUSD: number;
  lessons90d: number;
  earnings90d: number;
  monthlyUplift5: number;
  monthlyUplift10: number;
}

export interface SeasonalityPoint {
  month: string;
  paidLessons: number;
  normalizedIndex: number;
}

export interface RevenueForecast {
  monthly: number;
  day30Conservative: number;
  day30Optimistic: number;
  day60Conservative: number;
  day60Optimistic: number;
  day90Conservative: number;
  day90Optimistic: number;
  activeStudentCount: number;
}

export interface LTVPoint {
  lessonNumber: number;
  avgCumulativeEarnings: number;
  studentCount: number;
}

export interface InsightCallout {
  title: string;
  body: string;
  type: "info" | "warning" | "success" | "purple";
}

export interface ProcessedData {
  raw: RawLesson[];
  students: StudentSummary[];
  monthlyTrends: MonthlyTrend[];
  trialFunnel: TrialFunnelStats;
  scheduling: SchedulingStats;
  reactivation: ReactivationCandidate[];
  pricingOpportunities: PricingOpportunity[];
  seasonality: SeasonalityPoint[];
  revenueForecast: RevenueForecast;
  ltvCurve: LTVPoint[];
  insights: InsightCallout[];
  reportPeriod: { start: Date; end: Date };
  totalStudents: number;
  totalLessons: number;
  totalTrials: number;
  totalPaidLessons: number;
  totalGrossSales: number;
  totalEarnings: number;
  avgPaidLessonPrice: number;
  avgEarningsPerPaidLesson: number;
  medianPaidLessonsPerStudent: number;
  studentsActiveIn30d: number;
  studentsDormant180d: number;
}

export interface ThresholdResult {
  met: boolean;
  message: string;
}
