import Papa from "papaparse";
import type { RawLesson } from "./types";

const REQUIRED_COLUMNS = [
  "Service Type", "Student", "Student Location", "Lesson Date",
  "Date Confirmed", "Type", "Lesson Price, USD", "Tutor Payout, %", "Earning, USD",
];

export function validateColumns(headers: string[]): { valid: boolean; missing: string[] } {
  const normalized = headers.map((h) => h.trim());
  const missing = REQUIRED_COLUMNS.filter((col) => !normalized.includes(col));
  return { valid: missing.length === 0, missing };
}

function parseDateValue(value: string): Date {
  const trimmed = value.trim();
  if (trimmed === "-" || trimmed === "") return new Date(0);

  // ISO-ish format: 2024-09-24 14:00:00
  if (trimmed.includes("-") && trimmed.length >= 10) {
    const [datePart, timePart] = trimmed.split(" ");
    const [year, month, day] = datePart.split("-").map(Number);
    if (timePart) {
      const [hours, minutes] = timePart.split(":").map(Number);
      return new Date(year, month - 1, day, hours, minutes);
    }
    return new Date(year, month - 1, day);
  }

  // US short format: 9/24/24 14:00
  const [datePart, timePart] = trimmed.split(" ");
  const [month, day, year] = datePart.split("/").map(Number);
  const fullYear = year < 100 ? 2000 + year : year;
  if (timePart) {
    const [hours, minutes] = timePart.split(":").map(Number);
    return new Date(fullYear, month - 1, day, hours, minutes);
  }
  return new Date(fullYear, month - 1, day);
}

function parseNumericOrNull(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === "-" || trimmed === "") return null;
  const num = parseFloat(trimmed);
  return isNaN(num) ? null : num;
}

function isActualLesson(type: string): boolean {
  const t = type.trim();
  return t === "Trial" || t === "Non-trial lesson";
}

type ParseResult =
  | { success: true; data: RawLesson[]; skipped: number }
  | { success: false; error: string };

export function parseCSV(csvString: string): ParseResult {
  if (!csvString.trim()) {
    return { success: false, error: "File is empty." };
  }

  const parsed = Papa.parse<Record<string, string>>(csvString, {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.errors.length > 0 && parsed.data.length === 0) {
    return { success: false, error: `CSV parsing failed: ${parsed.errors[0].message}` };
  }

  const headers = parsed.meta.fields || [];
  const validation = validateColumns(headers);
  if (!validation.valid) {
    return {
      success: false,
      error: `Missing required columns: ${validation.missing.join(", ")}. Make sure you're uploading the tutor activity report from Preply.`,
    };
  }

  let skipped = 0;
  const lessons: RawLesson[] = [];

  for (const row of parsed.data) {
    const type = row["Type"]?.trim() || "";

    if (!isActualLesson(type)) {
      skipped++;
      continue;
    }

    lessons.push({
      serviceType: row["Service Type"]?.trim() || "",
      student: row["Student"]?.trim() || "Unknown",
      studentLocation: row["Student Location"]?.trim() || "Unknown",
      lessonDate: parseDateValue(row["Lesson Date"] || ""),
      dateConfirmed: parseDateValue(row["Date Confirmed"] || ""),
      type: type as "Trial" | "Non-trial lesson",
      lessonPriceUSD: parseFloat(row["Lesson Price, USD"] || "0"),
      tutorPayoutPercent: parseNumericOrNull(row["Tutor Payout, %"] || "-"),
      earningUSD: parseNumericOrNull(row["Earning, USD"] || "-"),
    });
  }

  return { success: true, data: lessons, skipped };
}
