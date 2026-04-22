import type { ProcessedData, ThresholdResult } from "./types";

type ViewKey =
  | "overview" | "studentSummary" | "scheduling"
  | "trialFunnel" | "speedToBook"
  | "monthlyTrends" | "concentrationRisk"
  | "healthScores" | "reactivation" | "pricing"
  | "ltvCurve" | "revenueForecast"
  | "seasonality"
  | "rateConversion";

function monthCount(data: ProcessedData): number {
  return data.monthlyTrends.length;
}

function dataSpanMonths(data: ProcessedData): number {
  if (data.raw.length === 0) return 0;
  const start = data.reportPeriod.start.getTime();
  const end = data.reportPeriod.end.getTime();
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24 * 30));
}

export function checkThreshold(view: ViewKey, data: ProcessedData): ThresholdResult {
  switch (view) {
    case "overview":
    case "studentSummary":
    case "scheduling":
      if (data.totalPaidLessons < 30) {
        return { met: false, message: `This view needs at least 30 paid lessons to show meaningful data. You have ${data.totalPaidLessons} so far.` };
      }
      return { met: true, message: "" };

    case "trialFunnel":
    case "speedToBook":
      if (data.trialFunnel.totalTrials < 20) {
        return { met: false, message: `This view needs at least 20 trials to show meaningful conversion patterns. You have ${data.trialFunnel.totalTrials} so far.` };
      }
      return { met: true, message: "" };

    case "monthlyTrends":
    case "concentrationRisk":
      if (monthCount(data) < 3 || data.totalStudents < 10) {
        return { met: false, message: `This view needs at least 3 months of data and 10 students. You have ${monthCount(data)} months and ${data.totalStudents} students.` };
      }
      return { met: true, message: "" };

    case "healthScores":
    case "reactivation":
    case "pricing":
      if (data.totalPaidLessons < 50 || dataSpanMonths(data) < 3) {
        return { met: false, message: `This view needs at least 50 paid lessons over 3+ months. You have ${data.totalPaidLessons} lessons over ${dataSpanMonths(data)} months.` };
      }
      return { met: true, message: "" };

    case "ltvCurve":
    case "revenueForecast":
      if (data.totalPaidLessons < 100 || dataSpanMonths(data) < 4) {
        return { met: false, message: `This view needs at least 100 paid lessons over 4+ months for reliable projections. You have ${data.totalPaidLessons} lessons over ${dataSpanMonths(data)} months.` };
      }
      return { met: true, message: "" };

    case "seasonality":
      if (monthCount(data) < 6) {
        return { met: false, message: `Seasonality patterns need at least 6 months of data. You have ${monthCount(data)} months so far.` };
      }
      return { met: true, message: "" };

    case "rateConversion":
      if (data.trialFunnel.totalTrials < 20 || monthCount(data) < 6) {
        return {
          met: false,
          message: `This view needs at least 20 trials and 6 months of data. You have ${data.trialFunnel.totalTrials} trials over ${monthCount(data)} months.`,
        };
      }
      return { met: true, message: "" };

    default:
      return { met: true, message: "" };
  }
}
