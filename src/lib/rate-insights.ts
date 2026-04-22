import type { RawLesson, StudentSummary, RateTimelinePoint, RateBucket } from "./types";

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

  const firstLessonByStudent = new Map<string, Date>();
  for (const lesson of raw) {
    const existing = firstLessonByStudent.get(lesson.student);
    if (!existing || lesson.lessonDate.getTime() < existing.getTime()) {
      firstLessonByStudent.set(lesson.student, lesson.lessonDate);
    }
  }

  const firstPaidByStudent = new Map<string, { date: Date; price: number }>();
  for (const lesson of raw) {
    if (lesson.type !== "Non-trial lesson") continue;
    const existing = firstPaidByStudent.get(lesson.student);
    if (!existing || lesson.lessonDate.getTime() < existing.date.getTime()) {
      firstPaidByStudent.set(lesson.student, {
        date: lesson.lessonDate,
        price: lesson.lessonPriceUSD,
      });
    }
  }

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

    const newStudents = new Set<string>();
    for (const lesson of monthLessons) {
      if (getMonthKey(firstLessonByStudent.get(lesson.student)!) === monthKey) {
        newStudents.add(lesson.student);
      }
    }

    if (trials.length === 0 && newStudents.size === 0) continue;

    const newStudentPrices: number[] = [];
    for (const s of newStudents) {
      const fp = firstPaidByStudent.get(s);
      if (fp) newStudentPrices.push(fp.price);
    }
    const newStudentAvgPrice =
      newStudentPrices.length > 0
        ? newStudentPrices.reduce((a, b) => a + b, 0) / newStudentPrices.length
        : null;

    let trialConversionRate: number | null = null;
    if (trials.length >= 3) {
      const convertedTrials = trials.filter((t) => converted.get(t.student) === true).length;
      trialConversionRate = convertedTrials / trials.length;
    }

    points.push({
      month: monthKey,
      newStudentAvgPrice,
      trialConversionRate,
      trialCount: trials.length,
      newStudentCount: newStudents.size,
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
