import type { RawLesson, StudentSummary, RateTimelinePoint, RateBucket, RateHeadline, RateInsights } from "./types";

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
    const paid = monthLessons.filter((l) => l.type === "Non-trial lesson");

    if (trials.length === 0 && paid.length === 0) continue;

    // Set rate = max paid-lesson price in the month. Max strips 30-min half-price
    // lessons and legacy rates (both are always ≤ current set rate on Preply).
    const setRate =
      paid.length > 0 ? Math.max(...paid.map((l) => l.lessonPriceUSD)) : null;

    let trialConversionRate: number | null = null;
    if (trials.length >= 3) {
      const convertedTrials = trials.filter((t) => converted.get(t.student) === true).length;
      trialConversionRate = convertedTrials / trials.length;
    }

    points.push({
      month: monthKey,
      setRate,
      trialConversionRate,
      trialCount: trials.length,
      paidLessonCount: paid.length,
    });
  }

  return points;
}

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

export function computeRateInsights(
  raw: RawLesson[],
  students: StudentSummary[]
): RateInsights {
  const timeline = computeRateTimeline(raw, students);
  const { buckets, bucketMode } = computeRateBuckets(raw, students);
  const headline = computeRateHeadline(buckets);
  return { timeline, buckets, bucketMode, headline };
}
