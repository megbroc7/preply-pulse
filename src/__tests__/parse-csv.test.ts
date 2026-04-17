import { describe, it, expect } from "vitest";
import { parseCSV, validateColumns } from "@/lib/parse-csv";

const VALID_CSV = `Service Type,Student,Student Location,Lesson Date,Date Confirmed,Type,"Lesson Price, USD","Tutor Payout, %","Earning, USD"
Preply Marketplace,Amengeh A.,Nigeria,9/24/24 14:00,9/24/24 15:28,Trial,15,-,-
Preply Marketplace,Amengeh A.,Nigeria,10/1/24 16:00,10/1/24 17:29,Non-trial lesson,15,67,10.05
Preply Marketplace,masa m.,Switzerland,10/5/24 8:30,10/5/24 9:11,Trial,7.5,-,-
Preply Marketplace,masa m.,Switzerland,10/5/24 18:00,10/5/24 19:14,Non-trial lesson,15,67,10.05`;

const MISSING_COLUMN_CSV = `Student,Student Location,Lesson Date
Amengeh A.,Nigeria,9/24/24 14:00`;

const EMPTY_CSV = ``;

describe("validateColumns", () => {
  it("returns valid for correct columns", () => {
    const headers = [
      "Service Type", "Student", "Student Location", "Lesson Date",
      "Date Confirmed", "Type", "Lesson Price, USD", "Tutor Payout, %", "Earning, USD",
    ];
    const result = validateColumns(headers);
    expect(result.valid).toBe(true);
    expect(result.missing).toEqual([]);
  });

  it("returns invalid with missing columns listed", () => {
    const headers = ["Student", "Student Location", "Lesson Date"];
    const result = validateColumns(headers);
    expect(result.valid).toBe(false);
    expect(result.missing).toContain("Type");
    expect(result.missing).toContain("Earning, USD");
  });
});

describe("parseCSV", () => {
  it("parses valid CSV into RawLesson array", () => {
    const result = parseCSV(VALID_CSV);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data).toHaveLength(4);
    expect(result.data[0].student).toBe("Amengeh A.");
    expect(result.data[0].type).toBe("Trial");
    expect(result.data[0].lessonPriceUSD).toBe(15);
    expect(result.data[0].tutorPayoutPercent).toBeNull();
    expect(result.data[0].earningUSD).toBeNull();
  });

  it("parses dash values as null for trial rows", () => {
    const result = parseCSV(VALID_CSV);
    if (!result.success) return;
    const trial = result.data[0];
    expect(trial.tutorPayoutPercent).toBeNull();
    expect(trial.earningUSD).toBeNull();
  });

  it("parses numeric values for paid lesson rows", () => {
    const result = parseCSV(VALID_CSV);
    if (!result.success) return;
    const paid = result.data[1];
    expect(paid.tutorPayoutPercent).toBe(67);
    expect(paid.earningUSD).toBe(10.05);
  });

  it("parses lesson dates correctly", () => {
    const result = parseCSV(VALID_CSV);
    if (!result.success) return;
    const lesson = result.data[0];
    expect(lesson.lessonDate).toBeInstanceOf(Date);
    expect(lesson.lessonDate.getFullYear()).toBe(2024);
    expect(lesson.lessonDate.getMonth()).toBe(8);
  });

  it("returns error for missing columns", () => {
    const result = parseCSV(MISSING_COLUMN_CSV);
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error).toContain("Missing");
  });

  it("returns error for empty input", () => {
    const result = parseCSV(EMPTY_CSV);
    expect(result.success).toBe(false);
  });
});
