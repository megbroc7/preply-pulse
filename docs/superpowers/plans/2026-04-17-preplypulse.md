# PreplyPulse Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a client-side Next.js app where Preply tutors upload their activity CSV and get an interactive dashboard with 11 analysis views, a demo mode, and a downloadable report.

**Architecture:** Next.js App Router with two pages: landing (`/`) and dashboard (`/dashboard`). All CSV parsing and data processing happens client-side via Papa Parse. Data flows through a React context provider: raw CSV → parsed rows → derived data structures → rendered views. No API routes, no database, no auth in v1.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS 4, shadcn/ui, Recharts, Papa Parse, html2canvas, Google Fonts (DM Sans + Inter)

---

## File Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout: fonts, metadata, providers
│   ├── page.tsx                # Landing page
│   ├── dashboard/
│   │   └── page.tsx            # Dashboard page (client component)
│   └── globals.css             # Tailwind + custom CSS variables
├── components/
│   ├── landing/
│   │   ├── hero.tsx            # Hero section with headline + CTA
│   │   ├── demo-section.tsx    # Demo dashboard wrapper with banner
│   │   ├── how-it-works.tsx    # 3-step explainer
│   │   ├── upload-section.tsx  # Upload CTA + privacy badge (landing version)
│   │   └── footer.tsx          # Built by Megan B. + donate + reddit link
│   ├── upload/
│   │   └── csv-uploader.tsx    # Drag-and-drop + file picker + validation
│   ├── dashboard/
│   │   ├── dashboard-layout.tsx    # Tab nav + header actions
│   │   ├── tab-overview.tsx        # Overview tab content
│   │   ├── tab-students.tsx        # Students tab content
│   │   ├── tab-growth.tsx          # Growth tab content
│   │   ├── tab-trials.tsx          # Trials tab content
│   │   ├── tab-actions.tsx         # Take Action tab content
│   │   ├── kpi-card.tsx            # Reusable metric card
│   │   ├── insight-callout.tsx     # Plain-English insight box
│   │   ├── student-table.tsx       # Sortable/searchable student table
│   │   ├── health-badge.tsx        # Green/yellow/red health indicator
│   │   ├── concentration-chart.tsx # Top-N earnings % chart
│   │   ├── monthly-trends-chart.tsx    # Line/bar chart for monthly data
│   │   ├── seasonality-chart.tsx       # Normalized monthly volume chart
│   │   ├── revenue-forecast-chart.tsx  # Area chart with bands
│   │   ├── trial-funnel-chart.tsx      # Conversion rate visualizations
│   │   ├── speed-to-book-chart.tsx     # Delay bucket bar chart
│   │   ├── ltv-curve-chart.tsx         # Cumulative earnings line chart
│   │   ├── reactivation-list.tsx       # Card list for dormant students
│   │   ├── pricing-table.tsx           # Uplift modeling table
│   │   ├── scheduling-chart.tsx        # Weekday + time bucket breakdown
│   │   ├── threshold-gate.tsx          # Progressive disclosure wrapper
│   │   └── download-report.tsx         # PDF/PNG export button
│   └── ui/                         # shadcn/ui components (auto-generated)
├── lib/
│   ├── types.ts                # All TypeScript types and interfaces
│   ├── parse-csv.ts            # Papa Parse wrapper + validation
│   ├── process-data.ts         # Raw rows → derived data structures
│   ├── compute-insights.ts     # Health scores, forecast, seasonality, LTV, callouts
│   ├── thresholds.ts           # Progressive disclosure threshold checks
│   ├── format.ts               # Number/date/currency formatting helpers
│   └── mock-data.ts            # Anonymized demo data for landing page
├── context/
│   └── data-context.tsx        # React context: stores parsed + processed data
└── __tests__/
    ├── parse-csv.test.ts       # CSV parsing + validation tests
    ├── process-data.test.ts    # Data aggregation tests
    ├── compute-insights.test.ts # Insight calculation tests
    └── thresholds.test.ts      # Threshold logic tests
```

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`

- [ ] **Step 1: Initialize Next.js project**

Run:
```bash
cd /Users/meganbroccoli/Desktop/Sabina/Web_Services/Preply-Tutor-App
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --yes
```

Expected: Project scaffolded with `src/app/` structure, `package.json` created.

- [ ] **Step 2: Install dependencies**

Run:
```bash
npm install papaparse recharts html2canvas
npm install -D @types/papaparse
```

Expected: Dependencies added to `package.json`.

- [ ] **Step 3: Initialize shadcn/ui**

Run:
```bash
npx shadcn@latest init -d
```

Expected: `components.json` created, `src/components/ui/` directory created, CSS variables added to `globals.css`.

- [ ] **Step 4: Install shadcn/ui components**

Run:
```bash
npx shadcn@latest add button card tabs badge table input tooltip
```

Expected: Components added under `src/components/ui/`.

- [ ] **Step 5: Configure Google Fonts in layout**

Replace the contents of `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { DM_Sans, Inter } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PreplyPulse — Insights for Preply Tutors",
  description:
    "Upload your Preply activity CSV and get actionable business insights. Made by a Preply tutor, for Preply tutors.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${dmSans.variable} ${inter.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 6: Update globals.css with brand colors and font assignments**

Add the following custom properties and overrides to `src/app/globals.css` (keep the existing Tailwind directives and shadcn variables, and add/override these):

```css
@layer base {
  :root {
    --preply-pink: 330 85% 66%;
    --preply-pink-light: 330 85% 95%;
    --preply-pink-dark: 330 85% 50%;
    --font-heading: var(--font-dm-sans);
    --font-body: var(--font-inter);
  }
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
}

body {
  font-family: var(--font-body);
}
```

- [ ] **Step 7: Initialize git and commit**

Run:
```bash
cd /Users/meganbroccoli/Desktop/Sabina/Web_Services/Preply-Tutor-App
git init
git add -A
git commit -m "chore: scaffold Next.js project with Tailwind, shadcn/ui, and dependencies"
```

Expected: Clean initial commit.

- [ ] **Step 8: Verify dev server starts**

Run:
```bash
npm run dev
```

Expected: Server starts on `localhost:3000`, page renders without errors.

---

### Task 2: TypeScript Types

**Files:**
- Create: `src/lib/types.ts`

- [ ] **Step 1: Create the types file**

Create `src/lib/types.ts`:

```typescript
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
  type: "info" | "warning" | "success";
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
```

- [ ] **Step 2: Commit**

Run:
```bash
git add src/lib/types.ts
git commit -m "feat: add TypeScript type definitions for all data structures"
```

---

### Task 3: CSV Parsing and Validation

**Files:**
- Create: `src/lib/parse-csv.ts`, `src/__tests__/parse-csv.test.ts`

- [ ] **Step 1: Install test runner**

Run:
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

Add to `package.json` scripts:
```json
"test": "vitest run",
"test:watch": "vitest"
```

Create `vitest.config.ts` at project root:

```typescript
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

- [ ] **Step 2: Write failing tests for CSV parsing**

Create `src/__tests__/parse-csv.test.ts`:

```typescript
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
      "Service Type",
      "Student",
      "Student Location",
      "Lesson Date",
      "Date Confirmed",
      "Type",
      "Lesson Price, USD",
      "Tutor Payout, %",
      "Earning, USD",
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
    expect(lesson.lessonDate.getMonth()).toBe(8); // September = 8
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
```

- [ ] **Step 3: Run tests to verify they fail**

Run:
```bash
npm test -- src/__tests__/parse-csv.test.ts
```

Expected: FAIL — modules not found.

- [ ] **Step 4: Implement CSV parser**

Create `src/lib/parse-csv.ts`:

```typescript
import Papa from "papaparse";
import type { RawLesson } from "./types";

const REQUIRED_COLUMNS = [
  "Service Type",
  "Student",
  "Student Location",
  "Lesson Date",
  "Date Confirmed",
  "Type",
  "Lesson Price, USD",
  "Tutor Payout, %",
  "Earning, USD",
];

export function validateColumns(headers: string[]): {
  valid: boolean;
  missing: string[];
} {
  const normalized = headers.map((h) => h.trim());
  const missing = REQUIRED_COLUMNS.filter((col) => !normalized.includes(col));
  return { valid: missing.length === 0, missing };
}

function parseDateValue(value: string): Date {
  const trimmed = value.trim();
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

type ParseResult =
  | { success: true; data: RawLesson[] }
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
    return {
      success: false,
      error: `CSV parsing failed: ${parsed.errors[0].message}`,
    };
  }

  const headers = parsed.meta.fields || [];
  const validation = validateColumns(headers);
  if (!validation.valid) {
    return {
      success: false,
      error: `Missing required columns: ${validation.missing.join(", ")}. Make sure you're uploading the tutor activity report from Preply.`,
    };
  }

  const lessons: RawLesson[] = parsed.data.map((row) => ({
    serviceType: row["Service Type"]?.trim() || "",
    student: row["Student"]?.trim() || "Unknown",
    studentLocation: row["Student Location"]?.trim() || "Unknown",
    lessonDate: parseDateValue(row["Lesson Date"] || ""),
    dateConfirmed: parseDateValue(row["Date Confirmed"] || ""),
    type: row["Type"]?.trim() as "Trial" | "Non-trial lesson",
    lessonPriceUSD: parseFloat(row["Lesson Price, USD"] || "0"),
    tutorPayoutPercent: parseNumericOrNull(row["Tutor Payout, %"] || "-"),
    earningUSD: parseNumericOrNull(row["Earning, USD"] || "-"),
  }));

  return { success: true, data: lessons };
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run:
```bash
npm test -- src/__tests__/parse-csv.test.ts
```

Expected: All tests PASS.

- [ ] **Step 6: Commit**

Run:
```bash
git add src/lib/parse-csv.ts src/__tests__/parse-csv.test.ts vitest.config.ts package.json package-lock.json
git commit -m "feat: add CSV parser with validation and tests"
```

---

### Task 4: Data Processing

**Files:**
- Create: `src/lib/process-data.ts`, `src/__tests__/process-data.test.ts`

- [ ] **Step 1: Write failing tests for data processing**

Create `src/__tests__/process-data.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { processData } from "@/lib/process-data";
import type { RawLesson } from "@/lib/types";

function makeLesson(overrides: Partial<RawLesson> = {}): RawLesson {
  return {
    serviceType: "Preply Marketplace",
    student: "Test Student",
    studentLocation: "United States",
    lessonDate: new Date(2025, 0, 15, 10, 0),
    dateConfirmed: new Date(2025, 0, 15, 11, 0),
    type: "Non-trial lesson",
    lessonPriceUSD: 40,
    tutorPayoutPercent: 72,
    earningUSD: 28.8,
    ...overrides,
  };
}

const SAMPLE_DATA: RawLesson[] = [
  makeLesson({
    student: "Alice",
    lessonDate: new Date(2025, 0, 10, 10, 0),
    type: "Trial",
    lessonPriceUSD: 20,
    tutorPayoutPercent: null,
    earningUSD: null,
  }),
  makeLesson({
    student: "Alice",
    lessonDate: new Date(2025, 0, 12, 10, 0),
    type: "Non-trial lesson",
    lessonPriceUSD: 40,
    earningUSD: 28.8,
  }),
  makeLesson({
    student: "Alice",
    lessonDate: new Date(2025, 0, 19, 10, 0),
    type: "Non-trial lesson",
    lessonPriceUSD: 40,
    earningUSD: 28.8,
  }),
  makeLesson({
    student: "Bob",
    lessonDate: new Date(2025, 0, 11, 14, 0),
    type: "Trial",
    lessonPriceUSD: 20,
    tutorPayoutPercent: null,
    earningUSD: null,
  }),
  makeLesson({
    student: "Charlie",
    lessonDate: new Date(2025, 1, 5, 9, 0),
    type: "Trial",
    lessonPriceUSD: 20,
    tutorPayoutPercent: null,
    earningUSD: null,
  }),
  makeLesson({
    student: "Charlie",
    lessonDate: new Date(2025, 1, 6, 9, 0),
    type: "Non-trial lesson",
    lessonPriceUSD: 50,
    earningUSD: 36,
  }),
];

describe("processData", () => {
  it("counts total students correctly", () => {
    const result = processData(SAMPLE_DATA);
    expect(result.totalStudents).toBe(3);
  });

  it("separates trials from paid lessons", () => {
    const result = processData(SAMPLE_DATA);
    expect(result.totalTrials).toBe(3);
    expect(result.totalPaidLessons).toBe(3);
  });

  it("calculates total earnings from paid lessons only", () => {
    const result = processData(SAMPLE_DATA);
    expect(result.totalEarnings).toBeCloseTo(93.6);
  });

  it("builds student summaries with correct lesson counts", () => {
    const result = processData(SAMPLE_DATA);
    const alice = result.students.find((s) => s.student === "Alice");
    expect(alice).toBeDefined();
    expect(alice!.paidLessons).toBe(2);
    expect(alice!.trials).toBe(1);
  });

  it("calculates trial-to-first-paid gap", () => {
    const result = processData(SAMPLE_DATA);
    const alice = result.students.find((s) => s.student === "Alice");
    expect(alice!.trialToFirstPaidGapDays).toBe(2);
  });

  it("sets gap to null for non-converting trial students", () => {
    const result = processData(SAMPLE_DATA);
    const bob = result.students.find((s) => s.student === "Bob");
    expect(bob!.trialToFirstPaidGapDays).toBeNull();
  });

  it("builds monthly trends", () => {
    const result = processData(SAMPLE_DATA);
    expect(result.monthlyTrends.length).toBeGreaterThanOrEqual(2);
    const jan = result.monthlyTrends.find((m) => m.month === "2025-01");
    expect(jan).toBeDefined();
    expect(jan!.trials).toBe(2);
    expect(jan!.paidLessons).toBe(2);
  });

  it("builds trial funnel with conversion rate", () => {
    const result = processData(SAMPLE_DATA);
    expect(result.trialFunnel.totalTrials).toBe(3);
    expect(result.trialFunnel.converted).toBe(2);
    expect(result.trialFunnel.conversionRate).toBeCloseTo(0.6667, 3);
  });

  it("builds delay buckets", () => {
    const result = processData(SAMPLE_DATA);
    expect(result.trialFunnel.delayBuckets.length).toBeGreaterThan(0);
  });

  it("identifies reactivation candidates", () => {
    const result = processData(SAMPLE_DATA);
    expect(Array.isArray(result.reactivation)).toBe(true);
  });

  it("builds scheduling stats by weekday", () => {
    const result = processData(SAMPLE_DATA);
    expect(result.scheduling.byWeekday.length).toBe(7);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:
```bash
npm test -- src/__tests__/process-data.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement data processing**

Create `src/lib/process-data.ts`:

```typescript
import type {
  RawLesson,
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
  ProcessedData,
  HealthScore,
} from "./types";
import { computeHealthScore, computeSeasonality, computeRevenueForecast, computeLTVCurve, generateInsights } from "./compute-insights";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const TIME_BUCKETS = ["Before 9", "9-12", "12-15", "15-18", "18-21", "21+"];

function getTimeBucket(date: Date): string {
  const hour = date.getHours();
  if (hour < 9) return "Before 9";
  if (hour < 12) return "9-12";
  if (hour < 15) return "12-15";
  if (hour < 18) return "15-18";
  if (hour < 21) return "18-21";
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
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

function buildStudentSummaries(
  lessons: RawLesson[],
  now: Date
): StudentSummary[] {
  const grouped = new Map<string, RawLesson[]>();
  for (const lesson of lessons) {
    const key = lesson.student;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(lesson);
  }

  const medianPrice = median(
    lessons
      .filter((l) => l.type === "Non-trial lesson" && l.earningUSD !== null)
      .map((l) => l.lessonPriceUSD)
  );

  const summaries: StudentSummary[] = [];

  for (const [student, studentLessons] of grouped) {
    const sorted = [...studentLessons].sort(
      (a, b) => a.lessonDate.getTime() - b.lessonDate.getTime()
    );
    const trials = sorted.filter((l) => l.type === "Trial");
    const paid = sorted.filter((l) => l.type === "Non-trial lesson");
    const firstLesson = sorted[0].lessonDate;
    const lastLesson = sorted[sorted.length - 1].lessonDate;

    let trialToFirstPaidGapDays: number | null = null;
    if (trials.length > 0 && paid.length > 0) {
      trialToFirstPaidGapDays = daysBetween(
        trials[0].lessonDate,
        paid[0].lessonDate
      );
    }

    const earningsArr = paid
      .map((l) => l.earningUSD)
      .filter((e): e is number => e !== null);
    const totalEarnings = earningsArr.reduce((sum, e) => sum + e, 0);
    const grossSales = studentLessons.reduce(
      (sum, l) => sum + l.lessonPriceUSD,
      0
    );
    const avgPaidPrice =
      paid.length > 0
        ? paid.reduce((sum, l) => sum + l.lessonPriceUSD, 0) / paid.length
        : 0;
    const lastPaidPrice =
      paid.length > 0 ? paid[paid.length - 1].lessonPriceUSD : 0;

    const daysSinceLast = daysBetween(lastLesson, now);
    const activeIn30d = daysSinceLast <= 30;

    const last90d = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const paidLast90d = paid.filter(
      (l) => l.lessonDate.getTime() >= last90d.getTime()
    );
    const lessonsPerMonth90d =
      paidLast90d.length > 0 ? (paidLast90d.length / 90) * 30 : 0;

    const healthScore = computeHealthScore(
      daysSinceLast,
      lessonsPerMonth90d,
      avgPaidPrice,
      medianPrice
    );

    summaries.push({
      student,
      studentLocation: sorted[0].studentLocation,
      totalLessons: sorted.length,
      trials: trials.length,
      paidLessons: paid.length,
      grossSalesUSD: grossSales,
      earningsUSD: totalEarnings,
      firstLesson,
      lastLesson,
      daysActive: daysBetween(firstLesson, lastLesson),
      daysSinceLast,
      avgPaidPriceUSD: avgPaidPrice,
      lastPaidPriceUSD: lastPaidPrice,
      trialToFirstPaidGapDays,
      healthScore,
      activeIn30d,
    });
  }

  return summaries.sort((a, b) => b.earningsUSD - a.earningsUSD);
}

function buildMonthlyTrends(lessons: RawLesson[]): MonthlyTrend[] {
  const monthMap = new Map<
    string,
    {
      students: Set<string>;
      newStudents: Set<string>;
      trials: number;
      paidLessons: number;
      grossSales: number;
      earnings: number;
      prices: number[];
    }
  >();

  const firstSeenMonth = new Map<string, string>();
  for (const lesson of lessons) {
    const month = getMonthKey(lesson.lessonDate);
    if (!firstSeenMonth.has(lesson.student)) {
      firstSeenMonth.set(lesson.student, month);
    }
  }

  for (const lesson of lessons) {
    const month = getMonthKey(lesson.lessonDate);
    if (!monthMap.has(month)) {
      monthMap.set(month, {
        students: new Set(),
        newStudents: new Set(),
        trials: 0,
        paidLessons: 0,
        grossSales: 0,
        earnings: 0,
        prices: [],
      });
    }
    const m = monthMap.get(month)!;
    m.students.add(lesson.student);
    if (firstSeenMonth.get(lesson.student) === month) {
      m.newStudents.add(lesson.student);
    }
    if (lesson.type === "Trial") {
      m.trials++;
    } else {
      m.paidLessons++;
      if (lesson.earningUSD !== null) m.earnings += lesson.earningUSD;
      m.prices.push(lesson.lessonPriceUSD);
    }
    m.grossSales += lesson.lessonPriceUSD;
  }

  const months = [...monthMap.keys()].sort();
  return months.map((month) => {
    const m = monthMap.get(month)!;
    const activeStudents = m.students.size;
    const avgPrice =
      m.prices.length > 0
        ? m.prices.reduce((a, b) => a + b, 0) / m.prices.length
        : 0;
    return {
      month,
      newStudents: m.newStudents.size,
      activeStudents,
      trials: m.trials,
      paidLessons: m.paidLessons,
      grossSalesUSD: m.grossSales,
      earningsUSD: m.earnings,
      avgPriceUSD: avgPrice,
      earningsPerActiveStudent:
        activeStudents > 0 ? m.earnings / activeStudents : 0,
    };
  });
}

function buildTrialFunnel(
  lessons: RawLesson[],
  students: StudentSummary[]
): TrialFunnelStats {
  const trialStudents = students.filter((s) => s.trials > 0);
  const converted = trialStudents.filter((s) => s.paidLessons > 0);
  const totalTrials = trialStudents.length;

  const trialLessons = lessons.filter((l) => l.type === "Trial");

  const byMonthMap = new Map<string, { trials: number; converted: number }>();
  for (const s of trialStudents) {
    const trialLesson = lessons.find(
      (l) => l.student === s.student && l.type === "Trial"
    );
    if (!trialLesson) continue;
    const month = getMonthKey(trialLesson.lessonDate);
    if (!byMonthMap.has(month))
      byMonthMap.set(month, { trials: 0, converted: 0 });
    const m = byMonthMap.get(month)!;
    m.trials++;
    if (s.paidLessons > 0) m.converted++;
  }

  const byMonth: TrialMonthStats[] = [...byMonthMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month,
      trials: data.trials,
      conversionRate: data.trials > 0 ? data.converted / data.trials : 0,
    }));

  const buildSlotStats = (
    getSlot: (d: Date) => string,
    allSlots?: string[]
  ): TrialSlotStats[] => {
    const slotMap = new Map<
      string,
      { trials: number; converted: number; ltvs: number[]; paidLessons: number[] }
    >();
    if (allSlots) {
      for (const slot of allSlots) {
        slotMap.set(slot, { trials: 0, converted: 0, ltvs: [], paidLessons: [] });
      }
    }
    for (const s of trialStudents) {
      const trialLesson = trialLessons.find((l) => l.student === s.student);
      if (!trialLesson) continue;
      const slot = getSlot(trialLesson.lessonDate);
      if (!slotMap.has(slot))
        slotMap.set(slot, { trials: 0, converted: 0, ltvs: [], paidLessons: [] });
      const m = slotMap.get(slot)!;
      m.trials++;
      if (s.paidLessons > 0) {
        m.converted++;
        m.ltvs.push(s.earningsUSD);
        m.paidLessons.push(s.paidLessons);
      }
    }
    return [...slotMap.entries()].map(([slot, data]) => ({
      slot,
      trials: data.trials,
      conversionRate: data.trials > 0 ? data.converted / data.trials : 0,
      avgLTV:
        data.ltvs.length > 0
          ? data.ltvs.reduce((a, b) => a + b, 0) / data.ltvs.length
          : 0,
      medianLTV: median(data.ltvs),
      avgPaidLessons:
        data.paidLessons.length > 0
          ? data.paidLessons.reduce((a, b) => a + b, 0) / data.paidLessons.length
          : 0,
    }));
  };

  const byWeekday = buildSlotStats(
    (d) => WEEKDAYS[d.getDay()],
    WEEKDAYS
  );
  const byTime = buildSlotStats(getTimeBucket, TIME_BUCKETS);

  const delayBuckets = buildDelayBuckets(trialStudents);

  return {
    totalTrials,
    converted: converted.length,
    notConverted: totalTrials - converted.length,
    conversionRate: totalTrials > 0 ? converted.length / totalTrials : 0,
    byMonth,
    byWeekday,
    byTime,
    delayBuckets,
  };
}

function buildDelayBuckets(trialStudents: StudentSummary[]): DelayBucket[] {
  const bucketDefs: { label: string; min: number; max: number }[] = [
    { label: "≤1d", min: 0, max: 1 },
    { label: "1-3d", min: 2, max: 3 },
    { label: "3-7d", min: 4, max: 7 },
    { label: "7-14d", min: 8, max: 14 },
    { label: "14d+", min: 15, max: Infinity },
  ];

  return bucketDefs.map(({ label, min, max }) => {
    const inBucket = trialStudents.filter((s) => {
      if (s.trialToFirstPaidGapDays === null) return false;
      return s.trialToFirstPaidGapDays >= min && s.trialToFirstPaidGapDays <= max;
    });
    const paidLessons = inBucket.map((s) => s.paidLessons);
    const earnings = inBucket.map((s) => s.earningsUSD);
    return {
      bucket: label,
      students: inBucket.length,
      avgPaidLessons:
        paidLessons.length > 0
          ? paidLessons.reduce((a, b) => a + b, 0) / paidLessons.length
          : 0,
      medianPaidLessons: median(paidLessons),
      avgLifetimeEarnings:
        earnings.length > 0
          ? earnings.reduce((a, b) => a + b, 0) / earnings.length
          : 0,
      medianLifetimeEarnings: median(earnings),
    };
  });
}

function buildSchedulingStats(lessons: RawLesson[]): SchedulingStats {
  const buildSlots = (
    getSlot: (d: Date) => string,
    allSlots: string[]
  ): SchedulingSlot[] => {
    const map = new Map<
      string,
      {
        lessons: number;
        paid: number;
        trials: number;
        students: Set<string>;
        gross: number;
        earnings: number;
        prices: number[];
      }
    >();
    for (const slot of allSlots) {
      map.set(slot, {
        lessons: 0,
        paid: 0,
        trials: 0,
        students: new Set(),
        gross: 0,
        earnings: 0,
        prices: [],
      });
    }
    for (const lesson of lessons) {
      const slot = getSlot(lesson.lessonDate);
      const m = map.get(slot)!;
      m.lessons++;
      m.students.add(lesson.student);
      m.gross += lesson.lessonPriceUSD;
      if (lesson.type === "Trial") {
        m.trials++;
      } else {
        m.paid++;
        if (lesson.earningUSD !== null) m.earnings += lesson.earningUSD;
        m.prices.push(lesson.lessonPriceUSD);
      }
    }
    return allSlots.map((slot) => {
      const m = map.get(slot)!;
      return {
        slot,
        lessons: m.lessons,
        paidLessons: m.paid,
        trials: m.trials,
        activeStudents: m.students.size,
        grossSalesUSD: m.gross,
        earningsUSD: m.earnings,
        avgPriceUSD:
          m.prices.length > 0
            ? m.prices.reduce((a, b) => a + b, 0) / m.prices.length
            : 0,
      };
    });
  };

  return {
    byWeekday: buildSlots((d) => WEEKDAYS[d.getDay()], WEEKDAYS),
    byTime: buildSlots(getTimeBucket, TIME_BUCKETS),
  };
}

function buildReactivation(
  students: StudentSummary[],
  now: Date
): ReactivationCandidate[] {
  const threshold90d = 90;
  return students
    .filter((s) => s.paidLessons >= 5 && s.daysSinceLast >= threshold90d)
    .sort((a, b) => b.paidLessons - a.paidLessons)
    .map((s) => ({
      student: s.student,
      studentLocation: s.studentLocation,
      paidLessons: s.paidLessons,
      earningsUSD: s.earningsUSD,
      lastLesson: s.lastLesson,
      daysSinceLast: s.daysSinceLast,
      lastPaidPriceUSD: s.lastPaidPriceUSD,
    }));
}

function buildPricingOpportunities(
  students: StudentSummary[],
  lessons: RawLesson[],
  now: Date
): PricingOpportunity[] {
  const activeStudents = students.filter((s) => s.activeIn30d);
  const medianPrice = median(
    activeStudents
      .filter((s) => s.lastPaidPriceUSD > 0)
      .map((s) => s.lastPaidPriceUSD)
  );

  const last90d = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  return activeStudents
    .filter((s) => s.lastPaidPriceUSD > 0 && s.lastPaidPriceUSD < medianPrice)
    .map((s) => {
      const paidLast90d = lessons.filter(
        (l) =>
          l.student === s.student &&
          l.type === "Non-trial lesson" &&
          l.lessonDate.getTime() >= last90d.getTime()
      );
      const earnings90d = paidLast90d.reduce(
        (sum, l) => sum + (l.earningUSD || 0),
        0
      );
      const lessonsPerMonth = (paidLast90d.length / 90) * 30;
      return {
        student: s.student,
        studentLocation: s.studentLocation,
        paidLessons: s.paidLessons,
        lastPaidPriceUSD: s.lastPaidPriceUSD,
        lessons90d: paidLast90d.length,
        earnings90d,
        monthlyUplift5: lessonsPerMonth * 5,
        monthlyUplift10: lessonsPerMonth * 10,
      };
    })
    .filter((p) => p.lessons90d >= 4)
    .sort((a, b) => b.monthlyUplift10 - a.monthlyUplift10);
}

export function processData(lessons: RawLesson[]): ProcessedData {
  const now = new Date();
  const sorted = [...lessons].sort(
    (a, b) => a.lessonDate.getTime() - b.lessonDate.getTime()
  );

  const students = buildStudentSummaries(sorted, now);
  const monthlyTrends = buildMonthlyTrends(sorted);
  const trialFunnel = buildTrialFunnel(sorted, students);
  const scheduling = buildSchedulingStats(sorted);
  const reactivation = buildReactivation(students, now);
  const pricingOpportunities = buildPricingOpportunities(
    students,
    sorted,
    now
  );

  const paidLessons = sorted.filter((l) => l.type === "Non-trial lesson");
  const trials = sorted.filter((l) => l.type === "Trial");
  const totalEarnings = paidLessons.reduce(
    (sum, l) => sum + (l.earningUSD || 0),
    0
  );
  const totalGrossSales = sorted.reduce(
    (sum, l) => sum + l.lessonPriceUSD,
    0
  );
  const avgPaidLessonPrice =
    paidLessons.length > 0
      ? paidLessons.reduce((sum, l) => sum + l.lessonPriceUSD, 0) /
        paidLessons.length
      : 0;
  const avgEarningsPerPaidLesson =
    paidLessons.length > 0 ? totalEarnings / paidLessons.length : 0;
  const paidLessonsPerStudent = students
    .filter((s) => s.paidLessons > 0)
    .map((s) => s.paidLessons);

  const seasonality = computeSeasonality(monthlyTrends);
  const revenueForecast = computeRevenueForecast(students, sorted, now);
  const ltvCurve = computeLTVCurve(sorted);
  const insights = generateInsights({
    students,
    trialFunnel,
    monthlyTrends,
    totalEarnings,
    avgPaidLessonPrice,
    reactivation,
    pricingOpportunities,
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
    insights,
    reportPeriod: {
      start: sorted[0].lessonDate,
      end: sorted[sorted.length - 1].lessonDate,
    },
    totalStudents: students.length,
    totalLessons: sorted.length,
    totalTrials: trials.length,
    totalPaidLessons: paidLessons.length,
    totalGrossSales: totalGrossSales,
    totalEarnings,
    avgPaidLessonPrice,
    avgEarningsPerPaidLesson,
    medianPaidLessonsPerStudent: median(paidLessonsPerStudent),
    studentsActiveIn30d: students.filter((s) => s.activeIn30d).length,
    studentsDormant180d: students.filter((s) => s.daysSinceLast >= 180).length,
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run:
```bash
npm test -- src/__tests__/process-data.test.ts
```

Expected: All tests PASS (this will initially fail because `compute-insights.ts` doesn't exist yet — proceed to Task 5 first, then return and run).

- [ ] **Step 5: Commit**

Run:
```bash
git add src/lib/process-data.ts src/__tests__/process-data.test.ts
git commit -m "feat: add data processing layer with student summaries, monthly trends, trial funnel, scheduling, reactivation, and pricing"
```

---

### Task 5: Computed Insights

**Files:**
- Create: `src/lib/compute-insights.ts`, `src/__tests__/compute-insights.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/__tests__/compute-insights.test.ts`:

```typescript
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run:
```bash
npm test -- src/__tests__/compute-insights.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement computed insights**

Create `src/lib/compute-insights.ts`:

```typescript
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

export function computeSeasonality(
  monthlyTrends: MonthlyTrend[]
): SeasonalityPoint[] {
  if (monthlyTrends.length === 0) return [];

  const avgLessons =
    monthlyTrends.reduce((sum, m) => sum + m.paidLessons, 0) /
    monthlyTrends.length;

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
      (l) =>
        l.student === student.student &&
        l.type === "Non-trial lesson" &&
        l.lessonDate.getTime() >= last90d.getTime()
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
    if (!paidByStudent.has(lesson.student)) {
      paidByStudent.set(lesson.student, []);
    }
    paidByStudent.get(lesson.student)!.push(lesson);
  }

  for (const [, studentLessons] of paidByStudent) {
    studentLessons.sort(
      (a, b) => a.lessonDate.getTime() - b.lessonDate.getTime()
    );
  }

  const maxLessons = Math.max(
    0,
    ...[...paidByStudent.values()].map((l) => l.length)
  );

  const points: LTVPoint[] = [];
  for (let i = 1; i <= maxLessons; i++) {
    const cumulativeEarnings: number[] = [];
    for (const [, studentLessons] of paidByStudent) {
      if (studentLessons.length >= i) {
        let cumulative = 0;
        for (let j = 0; j < i; j++) {
          cumulative += studentLessons[j].earningUSD || 0;
        }
        cumulativeEarnings.push(cumulative);
      }
    }
    if (cumulativeEarnings.length > 0) {
      points.push({
        lessonNumber: i,
        avgCumulativeEarnings:
          cumulativeEarnings.reduce((a, b) => a + b, 0) /
          cumulativeEarnings.length,
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

  const fastBucket = data.trialFunnel.delayBuckets.find(
    (b) => b.bucket === "1-3d"
  );
  const slowBucket = data.trialFunnel.delayBuckets.find(
    (b) => b.bucket === "14d+"
  );
  if (
    fastBucket &&
    slowBucket &&
    fastBucket.students > 0 &&
    slowBucket.students > 0
  ) {
    const ratio =
      slowBucket.avgPaidLessons > 0
        ? fastBucket.avgPaidLessons / slowBucket.avgPaidLessons
        : 0;
    if (ratio > 1.5) {
      insights.push({
        title: "Speed matters",
        body: `Students who book within 3 days of their trial average ${fastBucket.avgPaidLessons.toFixed(1)} paid lessons and $${fastBucket.avgLifetimeEarnings.toFixed(0)} lifetime earnings, versus ${slowBucket.avgPaidLessons.toFixed(1)} lessons and $${slowBucket.avgLifetimeEarnings.toFixed(0)} when they wait 14+ days.`,
        type: "info",
      });
    }
  }

  const sortedByEarnings = [...data.students].sort(
    (a, b) => b.earningsUSD - a.earningsUSD
  );
  if (sortedByEarnings.length >= 10) {
    const top5Earnings = sortedByEarnings
      .slice(0, 5)
      .reduce((s, st) => s + st.earningsUSD, 0);
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
      const recentAvgPrice =
        recent.reduce((s, m) => s + m.avgPriceUSD, 0) / recent.length;
      const earlierAvgPrice =
        earlier.reduce((s, m) => s + m.avgPriceUSD, 0) / earlier.length;
      const priceChange =
        earlierAvgPrice > 0
          ? ((recentAvgPrice - earlierAvgPrice) / earlierAvgPrice) * 100
          : 0;
      if (Math.abs(priceChange) > 10) {
        insights.push({
          title:
            priceChange > 0
              ? "Pricing is trending up"
              : "Pricing is trending down",
          body: `Your average lesson price ${priceChange > 0 ? "increased" : "decreased"} ${Math.abs(priceChange).toFixed(0)}% over the last 3 months compared to the prior 3.`,
          type: priceChange > 0 ? "success" : "warning",
        });
      }
    }
  }

  if (data.reactivation.length > 0) {
    const potentialEarnings = data.reactivation
      .slice(0, 10)
      .reduce((s, r) => s + r.lastPaidPriceUSD * 4, 0);
    insights.push({
      title: "Reactivation opportunity",
      body: `You have ${data.reactivation.length} former students who took 5+ lessons and have gone quiet. If just the top 10 came back for 4 lessons each, that's ~$${potentialEarnings.toFixed(0)} in potential revenue.`,
      type: "info",
    });
  }

  if (data.pricingOpportunities.length > 0) {
    const totalUplift = data.pricingOpportunities.reduce(
      (s, p) => s + p.monthlyUplift10,
      0
    );
    insights.push({
      title: "Legacy pricing drag",
      body: `You have ${data.pricingOpportunities.length} active students on rates below your current median. A $10 increase across this group would add ~$${totalUplift.toFixed(0)}/month to your earnings.`,
      type: "info",
    });
  }

  return insights;
}
```

- [ ] **Step 4: Run all tests**

Run:
```bash
npm test
```

Expected: All tests in `parse-csv.test.ts`, `compute-insights.test.ts`, and `process-data.test.ts` PASS.

- [ ] **Step 5: Commit**

Run:
```bash
git add src/lib/compute-insights.ts src/__tests__/compute-insights.test.ts
git commit -m "feat: add computed insights — health scores, seasonality, revenue forecast, LTV curve, and callout engine"
```

---

### Task 6: Threshold Logic and Formatting Helpers

**Files:**
- Create: `src/lib/thresholds.ts`, `src/lib/format.ts`, `src/__tests__/thresholds.test.ts`

- [ ] **Step 1: Write failing tests for thresholds**

Create `src/__tests__/thresholds.test.ts`:

```typescript
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run:
```bash
npm test -- src/__tests__/thresholds.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement thresholds**

Create `src/lib/thresholds.ts`:

```typescript
import type { ProcessedData, ThresholdResult } from "./types";

type ViewKey =
  | "overview"
  | "studentSummary"
  | "scheduling"
  | "trialFunnel"
  | "speedToBook"
  | "monthlyTrends"
  | "concentrationRisk"
  | "healthScores"
  | "reactivation"
  | "pricing"
  | "ltvCurve"
  | "revenueForecast"
  | "seasonality";

function monthCount(data: ProcessedData): number {
  return data.monthlyTrends.length;
}

function dataSpanMonths(data: ProcessedData): number {
  if (data.raw.length === 0) return 0;
  const start = data.reportPeriod.start.getTime();
  const end = data.reportPeriod.end.getTime();
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24 * 30));
}

export function checkThreshold(
  view: ViewKey,
  data: ProcessedData
): ThresholdResult {
  switch (view) {
    case "overview":
    case "studentSummary":
    case "scheduling":
      if (data.totalPaidLessons < 30) {
        return {
          met: false,
          message: `This view needs at least 30 paid lessons to show meaningful data. You have ${data.totalPaidLessons} so far.`,
        };
      }
      return { met: true, message: "" };

    case "trialFunnel":
    case "speedToBook":
      if (data.trialFunnel.totalTrials < 20) {
        return {
          met: false,
          message: `This view needs at least 20 trials to show meaningful conversion patterns. You have ${data.trialFunnel.totalTrials} so far.`,
        };
      }
      return { met: true, message: "" };

    case "monthlyTrends":
    case "concentrationRisk":
      if (monthCount(data) < 3 || data.totalStudents < 10) {
        return {
          met: false,
          message: `This view needs at least 3 months of data and 10 students. You have ${monthCount(data)} months and ${data.totalStudents} students.`,
        };
      }
      return { met: true, message: "" };

    case "healthScores":
    case "reactivation":
    case "pricing":
      if (data.totalPaidLessons < 50 || dataSpanMonths(data) < 3) {
        return {
          met: false,
          message: `This view needs at least 50 paid lessons over 3+ months. You have ${data.totalPaidLessons} lessons over ${dataSpanMonths(data)} months.`,
        };
      }
      return { met: true, message: "" };

    case "ltvCurve":
    case "revenueForecast":
      if (data.totalPaidLessons < 100 || dataSpanMonths(data) < 4) {
        return {
          met: false,
          message: `This view needs at least 100 paid lessons over 4+ months for reliable projections. You have ${data.totalPaidLessons} lessons over ${dataSpanMonths(data)} months.`,
        };
      }
      return { met: true, message: "" };

    case "seasonality":
      if (monthCount(data) < 6) {
        return {
          met: false,
          message: `Seasonality patterns need at least 6 months of data. You have ${monthCount(data)} months so far.`,
        };
      }
      return { met: true, message: "" };

    default:
      return { met: true, message: "" };
  }
}
```

- [ ] **Step 4: Create formatting helpers**

Create `src/lib/format.ts`:

```typescript
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCurrencyPrecise(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(Math.round(value));
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "2-digit",
  }).format(date);
}
```

- [ ] **Step 5: Run all tests**

Run:
```bash
npm test
```

Expected: All tests PASS.

- [ ] **Step 6: Commit**

Run:
```bash
git add src/lib/thresholds.ts src/lib/format.ts src/__tests__/thresholds.test.ts
git commit -m "feat: add progressive disclosure thresholds and formatting helpers"
```

---

### Task 7: Data Context Provider

**Files:**
- Create: `src/context/data-context.tsx`

- [ ] **Step 1: Create the context provider**

Create `src/context/data-context.tsx`:

```tsx
"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { parseCSV } from "@/lib/parse-csv";
import { processData } from "@/lib/process-data";
import type { ProcessedData } from "@/lib/types";

interface DataContextType {
  data: ProcessedData | null;
  isDemo: boolean;
  error: string | null;
  isLoading: boolean;
  loadCSV: (csvString: string) => void;
  loadDemo: () => void;
  reset: () => void;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ProcessedData | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadCSV = useCallback((csvString: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const parseResult = parseCSV(csvString);
      if (!parseResult.success) {
        setError(parseResult.error);
        setIsLoading(false);
        return;
      }
      const processed = processData(parseResult.data);
      setData(processed);
      setIsDemo(false);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "An unexpected error occurred while processing your data."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadDemo = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { MOCK_DATA } = await import("@/lib/mock-data");
      const processed = processData(MOCK_DATA);
      setData(processed);
      setIsDemo(true);
    } catch (e) {
      setError("Failed to load demo data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setIsDemo(false);
    setError(null);
  }, []);

  return (
    <DataContext.Provider
      value={{ data, isDemo, error, isLoading, loadCSV, loadDemo, reset }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData(): DataContextType {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
```

- [ ] **Step 2: Wrap the app in the provider**

Update `src/app/layout.tsx` — wrap `{children}` with the provider:

```tsx
import type { Metadata } from "next";
import { DM_Sans, Inter } from "next/font/google";
import { DataProvider } from "@/context/data-context";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PreplyPulse — Insights for Preply Tutors",
  description:
    "Upload your Preply activity CSV and get actionable business insights. Made by a Preply tutor, for Preply tutors.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${dmSans.variable} ${inter.variable} font-sans antialiased`}
      >
        <DataProvider>{children}</DataProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Commit**

Run:
```bash
git add src/context/data-context.tsx src/app/layout.tsx
git commit -m "feat: add data context provider for CSV state management"
```

---

### Task 8: Mock Data for Demo Dashboard

**Files:**
- Create: `src/lib/mock-data.ts`

- [ ] **Step 1: Create anonymized mock data**

Create `src/lib/mock-data.ts`. This generates realistic anonymized data matching the Preply CSV schema:

```typescript
import type { RawLesson } from "./types";

const MOCK_STUDENTS = [
  { name: "Student A", location: "United States" },
  { name: "Student B", location: "Germany" },
  { name: "Student C", location: "United Kingdom" },
  { name: "Student D", location: "United Arab Emirates" },
  { name: "Student E", location: "France" },
  { name: "Student F", location: "Netherlands" },
  { name: "Student G", location: "Australia" },
  { name: "Student H", location: "Spain" },
  { name: "Student I", location: "Brazil" },
  { name: "Student J", location: "Saudi Arabia" },
  { name: "Student K", location: "Italy" },
  { name: "Student L", location: "Ukraine" },
  { name: "Student M", location: "Switzerland" },
  { name: "Student N", location: "Poland" },
  { name: "Student O", location: "India" },
  { name: "Student P", location: "Nigeria" },
  { name: "Student Q", location: "Israel" },
  { name: "Student R", location: "Singapore" },
  { name: "Student S", location: "Qatar" },
  { name: "Student T", location: "Belgium" },
];

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateMockLessons(): RawLesson[] {
  const rand = seededRandom(42);
  const lessons: RawLesson[] = [];
  const startDate = new Date(2024, 8, 15);

  for (const student of MOCK_STUDENTS) {
    const trialDate = new Date(
      startDate.getTime() + Math.floor(rand() * 180) * 24 * 60 * 60 * 1000
    );
    const hour = 8 + Math.floor(rand() * 13);

    lessons.push({
      serviceType: "Preply Marketplace",
      student: student.name,
      studentLocation: student.location,
      lessonDate: new Date(trialDate.getFullYear(), trialDate.getMonth(), trialDate.getDate(), hour, 0),
      dateConfirmed: new Date(trialDate.getFullYear(), trialDate.getMonth(), trialDate.getDate(), hour + 1, 0),
      type: "Trial",
      lessonPriceUSD: 15 + Math.floor(rand() * 4) * 5,
      tutorPayoutPercent: null,
      earningUSD: null,
    });

    const converts = rand() > 0.3;
    if (!converts) continue;

    const delayDays = Math.floor(rand() * rand() * 14) + 1;
    const basePrice = 20 + Math.floor(rand() * 10) * 5;
    const payoutPct = 67 + Math.floor(rand() * 3) * 5;
    const totalPaidLessons = Math.floor(rand() * rand() * 80) + 1;

    for (let i = 0; i < totalPaidLessons; i++) {
      const dayOffset = delayDays + Math.floor(i * (3 + rand() * 7));
      const lessonDate = new Date(
        trialDate.getTime() + dayOffset * 24 * 60 * 60 * 1000
      );
      const lessonHour = 8 + Math.floor(rand() * 13);
      const price = basePrice + Math.floor(i / 20) * 5;
      const earning = parseFloat(((price * payoutPct) / 100).toFixed(2));

      lessons.push({
        serviceType: "Preply Marketplace",
        student: student.name,
        studentLocation: student.location,
        lessonDate: new Date(lessonDate.getFullYear(), lessonDate.getMonth(), lessonDate.getDate(), lessonHour, 0),
        dateConfirmed: new Date(lessonDate.getFullYear(), lessonDate.getMonth(), lessonDate.getDate(), lessonHour + 1, 0),
        type: "Non-trial lesson",
        lessonPriceUSD: price,
        tutorPayoutPercent: payoutPct,
        earningUSD: earning,
      });
    }
  }

  return lessons.sort(
    (a, b) => a.lessonDate.getTime() - b.lessonDate.getTime()
  );
}

export const MOCK_DATA: RawLesson[] = generateMockLessons();
```

- [ ] **Step 2: Commit**

Run:
```bash
git add src/lib/mock-data.ts
git commit -m "feat: add anonymized mock data generator for demo dashboard"
```

---

### Task 9: CSV Uploader Component

**Files:**
- Create: `src/components/upload/csv-uploader.tsx`

- [ ] **Step 1: Create the uploader component**

Create `src/components/upload/csv-uploader.tsx`:

```tsx
"use client";

import { useCallback, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useData } from "@/context/data-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function CSVUploader() {
  const { loadCSV, error, isLoading } = useData();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.name.endsWith(".csv")) {
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        loadCSV(text);
        router.push("/dashboard");
      };
      reader.readAsText(file);
    },
    [loadCSV, router]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <Card
      className={`border-2 border-dashed p-12 text-center transition-colors cursor-pointer ${
        isDragOver
          ? "border-[hsl(var(--preply-pink))] bg-[hsl(var(--preply-pink-light))]"
          : "border-muted-foreground/25 hover:border-[hsl(var(--preply-pink))]"
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleInputChange}
        className="hidden"
      />
      <div className="flex flex-col items-center gap-4">
        <div className="text-4xl">📊</div>
        <div>
          <p className="text-lg font-medium font-[family-name:var(--font-dm-sans)]">
            {isLoading
              ? "Processing your data..."
              : "Drop your Preply CSV here, or click to browse"}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Export your tutor activity report from Preply and upload the CSV file
          </p>
        </div>
        <Button
          variant="outline"
          size="lg"
          disabled={isLoading}
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
        >
          Choose File
        </Button>
        {error && (
          <p className="text-sm text-red-600 mt-2 max-w-md">{error}</p>
        )}
        <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          100% private — processed in your browser, never sent to any server
        </div>
      </div>
    </Card>
  );
}
```

- [ ] **Step 2: Commit**

Run:
```bash
git add src/components/upload/csv-uploader.tsx
git commit -m "feat: add CSV uploader with drag-and-drop, validation, and privacy badge"
```

---

### Task 10: Dashboard Layout and Shared Components

**Files:**
- Create: `src/components/dashboard/dashboard-layout.tsx`, `src/components/dashboard/kpi-card.tsx`, `src/components/dashboard/insight-callout.tsx`, `src/components/dashboard/health-badge.tsx`, `src/components/dashboard/threshold-gate.tsx`, `src/components/dashboard/download-report.tsx`

- [ ] **Step 1: Create KPI card**

Create `src/components/dashboard/kpi-card.tsx`:

```tsx
import { Card } from "@/components/ui/card";

interface KPICardProps {
  label: string;
  value: string;
  subtitle?: string;
}

export function KPICard({ label, value, subtitle }: KPICardProps) {
  return (
    <Card className="p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold font-[family-name:var(--font-dm-sans)] mt-1">
        {value}
      </p>
      {subtitle && (
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      )}
    </Card>
  );
}
```

- [ ] **Step 2: Create insight callout**

Create `src/components/dashboard/insight-callout.tsx`:

```tsx
import type { InsightCallout as InsightCalloutType } from "@/lib/types";

const STYLES = {
  info: "bg-blue-50 border-blue-200 text-blue-900",
  warning: "bg-amber-50 border-amber-200 text-amber-900",
  success: "bg-emerald-50 border-emerald-200 text-emerald-900",
};

export function InsightCallout({ title, body, type }: InsightCalloutType) {
  return (
    <div className={`rounded-lg border p-4 ${STYLES[type]}`}>
      <p className="font-medium font-[family-name:var(--font-dm-sans)]">
        {title}
      </p>
      <p className="text-sm mt-1 opacity-90">{body}</p>
    </div>
  );
}
```

- [ ] **Step 3: Create health badge**

Create `src/components/dashboard/health-badge.tsx`:

```tsx
import { Badge } from "@/components/ui/badge";
import type { HealthScore } from "@/lib/types";

const VARIANTS: Record<HealthScore["label"], string> = {
  Healthy: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100",
  "At Risk": "bg-amber-100 text-amber-800 hover:bg-amber-100",
  Fading: "bg-red-100 text-red-800 hover:bg-red-100",
};

export function HealthBadge({ label }: { label: HealthScore["label"] }) {
  return (
    <Badge variant="secondary" className={VARIANTS[label]}>
      {label}
    </Badge>
  );
}
```

- [ ] **Step 4: Create threshold gate**

Create `src/components/dashboard/threshold-gate.tsx`:

```tsx
"use client";

import type { ReactNode } from "react";
import type { ThresholdResult } from "@/lib/types";
import { Card } from "@/components/ui/card";

interface ThresholdGateProps {
  threshold: ThresholdResult;
  children: ReactNode;
}

export function ThresholdGate({ threshold, children }: ThresholdGateProps) {
  if (threshold.met) return <>{children}</>;

  return (
    <Card className="p-8 text-center">
      <div className="text-3xl mb-3">📈</div>
      <p className="text-muted-foreground max-w-md mx-auto">
        {threshold.message}
      </p>
    </Card>
  );
}
```

- [ ] **Step 5: Create download report button**

Create `src/components/dashboard/download-report.tsx`:

```tsx
"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";

export function DownloadReport() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const dashboardEl = document.getElementById("dashboard-content");
      if (!dashboardEl) return;

      const canvas = await html2canvas(dashboardEl, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const link = document.createElement("a");
      link.download = `preplypulse-report-${new Date().toISOString().split("T")[0]}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      // Silently fail — the button just doesn't produce output
    } finally {
      setIsExporting(false);
    }
  }, []);

  return (
    <Button variant="outline" size="sm" onClick={handleExport} disabled={isExporting}>
      {isExporting ? "Exporting..." : "Download Report"}
    </Button>
  );
}
```

- [ ] **Step 6: Create dashboard layout**

Create `src/components/dashboard/dashboard-layout.tsx`:

```tsx
"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useData } from "@/context/data-context";
import { Button } from "@/components/ui/button";
import { DownloadReport } from "./download-report";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "students", label: "Students" },
  { key: "growth", label: "Growth" },
  { key: "trials", label: "Trials" },
  { key: "actions", label: "Take Action" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

interface DashboardLayoutProps {
  tabs: Record<TabKey, ReactNode>;
  demoBanner?: boolean;
}

export function DashboardLayout({ tabs, demoBanner }: DashboardLayoutProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const { reset } = useData();
  const router = useRouter();

  const handleReset = () => {
    reset();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {demoBanner && (
        <div className="bg-[hsl(var(--preply-pink-light))] text-center py-2 text-sm">
          This is sample data. Upload yours to see your real insights.
        </div>
      )}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-bold font-[family-name:var(--font-dm-sans)]">
              <span className="text-[hsl(var(--preply-pink))]">Preply</span>
              Pulse
            </h1>
            <div className="flex items-center gap-3">
              <DownloadReport />
              <Button variant="ghost" size="sm" onClick={handleReset}>
                Upload New File
              </Button>
            </div>
          </div>
          <nav className="flex gap-1 -mb-px">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? "border-[hsl(var(--preply-pink))] text-[hsl(var(--preply-pink))]"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>
      <main
        id="dashboard-content"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        {tabs[activeTab]}
      </main>
    </div>
  );
}
```

- [ ] **Step 7: Commit**

Run:
```bash
git add src/components/dashboard/
git commit -m "feat: add dashboard layout, KPI cards, insight callouts, health badges, threshold gates, and download report"
```

---

### Task 11: Overview Tab

**Files:**
- Create: `src/components/dashboard/tab-overview.tsx`

- [ ] **Step 1: Create overview tab**

Create `src/components/dashboard/tab-overview.tsx`:

```tsx
"use client";

import type { ProcessedData } from "@/lib/types";
import { KPICard } from "./kpi-card";
import { InsightCallout } from "./insight-callout";
import {
  formatCurrency,
  formatCurrencyPrecise,
  formatPercent,
  formatNumber,
  formatDate,
} from "@/lib/format";

interface TabOverviewProps {
  data: ProcessedData;
}

export function TabOverview({ data }: TabOverviewProps) {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-muted-foreground mb-4">
          Report period: {formatDate(data.reportPeriod.start)} –{" "}
          {formatDate(data.reportPeriod.end)}
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <KPICard
            label="Total Students"
            value={formatNumber(data.totalStudents)}
          />
          <KPICard
            label="Total Lessons"
            value={formatNumber(data.totalLessons)}
            subtitle={`${formatNumber(data.totalPaidLessons)} paid`}
          />
          <KPICard
            label="Total Earnings"
            value={formatCurrency(data.totalEarnings)}
            subtitle={`${formatCurrency(data.totalGrossSales)} gross`}
          />
          <KPICard
            label="Avg Lesson Price"
            value={formatCurrencyPrecise(data.avgPaidLessonPrice)}
          />
          <KPICard
            label="Trial Conversion"
            value={formatPercent(data.trialFunnel.conversionRate)}
            subtitle={`${data.trialFunnel.converted} of ${data.trialFunnel.totalTrials}`}
          />
          <KPICard
            label="Active (30d)"
            value={formatNumber(data.studentsActiveIn30d)}
            subtitle={`${formatNumber(data.studentsDormant180d)} dormant 180d+`}
          />
        </div>
      </div>

      {data.insights.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold font-[family-name:var(--font-dm-sans)] mb-4">
            What stands out
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {data.insights.map((insight, i) => (
              <InsightCallout key={i} {...insight} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

Run:
```bash
git add src/components/dashboard/tab-overview.tsx
git commit -m "feat: add Overview tab with KPI cards and insight callouts"
```

---

### Task 12: Students Tab

**Files:**
- Create: `src/components/dashboard/student-table.tsx`, `src/components/dashboard/concentration-chart.tsx`, `src/components/dashboard/tab-students.tsx`

- [ ] **Step 1: Create student table**

Create `src/components/dashboard/student-table.tsx`:

```tsx
"use client";

import { useState, useMemo } from "react";
import type { StudentSummary } from "@/lib/types";
import { HealthBadge } from "./health-badge";
import {
  formatCurrency,
  formatNumber,
  formatDate,
} from "@/lib/format";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface StudentTableProps {
  students: StudentSummary[];
  showHealthScore: boolean;
}

type SortKey = keyof Pick<
  StudentSummary,
  "student" | "paidLessons" | "earningsUSD" | "daysSinceLast" | "avgPaidPriceUSD" | "lastPaidPriceUSD"
>;

export function StudentTable({ students, showHealthScore }: StudentTableProps) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("earningsUSD");
  const [sortAsc, setSortAsc] = useState(false);

  const filtered = useMemo(() => {
    let result = students;
    if (search) {
      const lower = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.student.toLowerCase().includes(lower) ||
          s.studentLocation.toLowerCase().includes(lower)
      );
    }
    return [...result].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortAsc
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return sortAsc
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });
  }, [students, search, sortKey, sortAsc]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  const sortIndicator = (key: SortKey) =>
    sortKey === key ? (sortAsc ? " ↑" : " ↓") : "";

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search students..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("student")}
              >
                Student{sortIndicator("student")}
              </TableHead>
              <TableHead>Location</TableHead>
              <TableHead
                className="cursor-pointer text-right"
                onClick={() => handleSort("paidLessons")}
              >
                Paid Lessons{sortIndicator("paidLessons")}
              </TableHead>
              <TableHead
                className="cursor-pointer text-right"
                onClick={() => handleSort("earningsUSD")}
              >
                Earnings{sortIndicator("earningsUSD")}
              </TableHead>
              <TableHead
                className="cursor-pointer text-right"
                onClick={() => handleSort("avgPaidPriceUSD")}
              >
                Avg Price{sortIndicator("avgPaidPriceUSD")}
              </TableHead>
              <TableHead
                className="cursor-pointer text-right"
                onClick={() => handleSort("lastPaidPriceUSD")}
              >
                Last Price{sortIndicator("lastPaidPriceUSD")}
              </TableHead>
              <TableHead
                className="cursor-pointer text-right"
                onClick={() => handleSort("daysSinceLast")}
              >
                Days Since Last{sortIndicator("daysSinceLast")}
              </TableHead>
              {showHealthScore && <TableHead>Health</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((s) => (
              <TableRow key={s.student}>
                <TableCell className="font-medium">{s.student}</TableCell>
                <TableCell>{s.studentLocation}</TableCell>
                <TableCell className="text-right">
                  {formatNumber(s.paidLessons)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(s.earningsUSD)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(s.avgPaidPriceUSD)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(s.lastPaidPriceUSD)}
                </TableCell>
                <TableCell className="text-right">
                  {s.daysSinceLast}
                </TableCell>
                {showHealthScore && (
                  <TableCell>
                    <HealthBadge label={s.healthScore.label} />
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="text-sm text-muted-foreground">
        Showing {filtered.length} of {students.length} students
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Create concentration chart**

Create `src/components/dashboard/concentration-chart.tsx`:

```tsx
"use client";

import type { StudentSummary } from "@/lib/types";
import { formatPercent, formatCurrency } from "@/lib/format";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ConcentrationChartProps {
  students: StudentSummary[];
  totalEarnings: number;
}

export function ConcentrationChart({
  students,
  totalEarnings,
}: ConcentrationChartProps) {
  const sorted = [...students].sort(
    (a, b) => b.earningsUSD - a.earningsUSD
  );

  const top5 = sorted.slice(0, 5).reduce((s, st) => s + st.earningsUSD, 0);
  const top10 = sorted.slice(0, 10).reduce((s, st) => s + st.earningsUSD, 0);
  const rest = totalEarnings - top10;

  const data = [
    { label: "Top 5", value: (top5 / totalEarnings) * 100, earnings: top5 },
    {
      label: "Top 6-10",
      value: ((top10 - top5) / totalEarnings) * 100,
      earnings: top10 - top5,
    },
    {
      label: "Everyone Else",
      value: (rest / totalEarnings) * 100,
      earnings: rest,
    },
  ];

  const top5Pct = top5 / totalEarnings;

  return (
    <div className="space-y-4">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical">
            <XAxis type="number" tickFormatter={(v) => `${v.toFixed(0)}%`} />
            <YAxis type="category" dataKey="label" width={100} />
            <Tooltip
              formatter={(value: number, _name: string, props: { payload: { earnings: number } }) => [
                `${value.toFixed(1)}% (${formatCurrency(props.payload.earnings)})`,
                "Share",
              ]}
            />
            <Bar dataKey="value" fill="hsl(330, 85%, 66%)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {top5Pct > 0.5 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          Your top 5 students account for {formatPercent(top5Pct)} of your
          earnings. Consider diversifying to reduce risk.
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create students tab**

Create `src/components/dashboard/tab-students.tsx`:

```tsx
"use client";

import type { ProcessedData } from "@/lib/types";
import { checkThreshold } from "@/lib/thresholds";
import { ThresholdGate } from "./threshold-gate";
import { StudentTable } from "./student-table";
import { ConcentrationChart } from "./concentration-chart";

interface TabStudentsProps {
  data: ProcessedData;
}

export function TabStudents({ data }: TabStudentsProps) {
  const healthThreshold = checkThreshold("healthScores", data);
  const concentrationThreshold = checkThreshold("concentrationRisk", data);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold font-[family-name:var(--font-dm-sans)] mb-4">
          Student Summary
        </h2>
        <StudentTable
          students={data.students}
          showHealthScore={healthThreshold.met}
        />
      </div>

      <div>
        <h2 className="text-lg font-semibold font-[family-name:var(--font-dm-sans)] mb-4">
          Concentration Risk
        </h2>
        <ThresholdGate threshold={concentrationThreshold}>
          <ConcentrationChart
            students={data.students}
            totalEarnings={data.totalEarnings}
          />
        </ThresholdGate>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

Run:
```bash
git add src/components/dashboard/student-table.tsx src/components/dashboard/concentration-chart.tsx src/components/dashboard/tab-students.tsx
git commit -m "feat: add Students tab with sortable table, health scores, and concentration risk chart"
```

---

### Task 13: Growth Tab

**Files:**
- Create: `src/components/dashboard/monthly-trends-chart.tsx`, `src/components/dashboard/seasonality-chart.tsx`, `src/components/dashboard/revenue-forecast-chart.tsx`, `src/components/dashboard/tab-growth.tsx`

- [ ] **Step 1: Create monthly trends chart**

Create `src/components/dashboard/monthly-trends-chart.tsx`:

```tsx
"use client";

import type { MonthlyTrend } from "@/lib/types";
import { formatMonthLabel, formatCurrency } from "@/lib/format";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface MonthlyTrendsChartProps {
  trends: MonthlyTrend[];
}

export function MonthlyTrendsChart({ trends }: MonthlyTrendsChartProps) {
  const chartData = trends.map((t) => ({
    ...t,
    label: formatMonthLabel(t.month),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-2">Earnings & Avg Price</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <XAxis dataKey="label" fontSize={12} />
              <YAxis
                yAxisId="left"
                tickFormatter={(v) => `$${v}`}
                fontSize={12}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tickFormatter={(v) => `$${v}`}
                fontSize={12}
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  formatCurrency(value),
                  name,
                ]}
              />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="earningsUSD"
                name="Earnings"
                fill="hsl(330, 85%, 66%)"
                radius={[2, 2, 0, 0]}
              />
              <Line
                yAxisId="right"
                dataKey="avgPriceUSD"
                name="Avg Price"
                stroke="hsl(210, 40%, 50%)"
                strokeWidth={2}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2">Active Students & Lessons</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <XAxis dataKey="label" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="paidLessons"
                name="Paid Lessons"
                fill="hsl(330, 85%, 80%)"
                radius={[2, 2, 0, 0]}
              />
              <Line
                dataKey="activeStudents"
                name="Active Students"
                stroke="hsl(170, 40%, 45%)"
                strokeWidth={2}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create seasonality chart**

Create `src/components/dashboard/seasonality-chart.tsx`:

```tsx
"use client";

import type { SeasonalityPoint } from "@/lib/types";
import { formatMonthLabel } from "@/lib/format";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface SeasonalityChartProps {
  data: SeasonalityPoint[];
}

export function SeasonalityChart({ data }: SeasonalityChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    label: formatMonthLabel(d.month),
    fillColor:
      d.normalizedIndex >= 1
        ? "hsl(330, 85%, 66%)"
        : "hsl(330, 30%, 80%)",
  }));

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <XAxis dataKey="label" fontSize={12} />
          <YAxis
            tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
            fontSize={12}
          />
          <Tooltip
            formatter={(value: number) => [
              `${(value * 100).toFixed(0)}% of average`,
              "Activity",
            ]}
          />
          <ReferenceLine
            y={1}
            stroke="hsl(210, 20%, 60%)"
            strokeDasharray="3 3"
            label="Average"
          />
          <Bar dataKey="normalizedIndex" radius={[2, 2, 0, 0]}>
            {chartData.map((entry, i) => (
              <rect key={i} fill={entry.fillColor} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
```

- [ ] **Step 3: Create revenue forecast chart**

Create `src/components/dashboard/revenue-forecast-chart.tsx`:

```tsx
"use client";

import type { RevenueForecast } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface RevenueForecastChartProps {
  forecast: RevenueForecast;
}

export function RevenueForecastChart({ forecast }: RevenueForecastChartProps) {
  const chartData = [
    {
      period: "Now",
      conservative: 0,
      optimistic: 0,
      projected: 0,
    },
    {
      period: "30 days",
      conservative: forecast.day30Conservative,
      optimistic: forecast.day30Optimistic,
      projected: forecast.monthly,
    },
    {
      period: "60 days",
      conservative: forecast.day60Conservative,
      optimistic: forecast.day60Optimistic,
      projected: forecast.monthly * 2,
    },
    {
      period: "90 days",
      conservative: forecast.day90Conservative,
      optimistic: forecast.day90Optimistic,
      projected: forecast.monthly * 3,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <XAxis dataKey="period" fontSize={12} />
            <YAxis tickFormatter={(v) => `$${v}`} fontSize={12} />
            <Tooltip
              formatter={(value: number, name: string) => [
                formatCurrency(value),
                name,
              ]}
            />
            <Area
              dataKey="optimistic"
              name="Optimistic"
              stroke="hsl(330, 85%, 66%)"
              fill="hsl(330, 85%, 90%)"
              strokeWidth={0}
            />
            <Area
              dataKey="projected"
              name="Projected"
              stroke="hsl(330, 85%, 66%)"
              fill="hsl(330, 85%, 80%)"
              strokeWidth={2}
            />
            <Area
              dataKey="conservative"
              name="Conservative"
              stroke="hsl(330, 50%, 60%)"
              fill="hsl(330, 85%, 95%)"
              strokeWidth={0}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="text-sm text-muted-foreground">
        Based on {forecast.activeStudentCount} currently active students and
        their recent lesson cadence. Projected monthly earnings:{" "}
        {formatCurrency(forecast.monthly)}.
      </p>
    </div>
  );
}
```

- [ ] **Step 4: Create growth tab**

Create `src/components/dashboard/tab-growth.tsx`:

```tsx
"use client";

import type { ProcessedData } from "@/lib/types";
import { checkThreshold } from "@/lib/thresholds";
import { ThresholdGate } from "./threshold-gate";
import { MonthlyTrendsChart } from "./monthly-trends-chart";
import { SeasonalityChart } from "./seasonality-chart";
import { RevenueForecastChart } from "./revenue-forecast-chart";

interface TabGrowthProps {
  data: ProcessedData;
}

export function TabGrowth({ data }: TabGrowthProps) {
  const trendsThreshold = checkThreshold("monthlyTrends", data);
  const seasonalityThreshold = checkThreshold("seasonality", data);
  const forecastThreshold = checkThreshold("revenueForecast", data);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold font-[family-name:var(--font-dm-sans)] mb-4">
          Monthly Trends
        </h2>
        <ThresholdGate threshold={trendsThreshold}>
          <MonthlyTrendsChart trends={data.monthlyTrends} />
        </ThresholdGate>
      </div>

      <div>
        <h2 className="text-lg font-semibold font-[family-name:var(--font-dm-sans)] mb-4">
          Seasonality
        </h2>
        <ThresholdGate threshold={seasonalityThreshold}>
          <SeasonalityChart data={data.seasonality} />
        </ThresholdGate>
      </div>

      <div>
        <h2 className="text-lg font-semibold font-[family-name:var(--font-dm-sans)] mb-4">
          Revenue Forecast
        </h2>
        <ThresholdGate threshold={forecastThreshold}>
          <RevenueForecastChart forecast={data.revenueForecast} />
        </ThresholdGate>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

Run:
```bash
git add src/components/dashboard/monthly-trends-chart.tsx src/components/dashboard/seasonality-chart.tsx src/components/dashboard/revenue-forecast-chart.tsx src/components/dashboard/tab-growth.tsx
git commit -m "feat: add Growth tab with monthly trends, seasonality, and revenue forecast charts"
```

---

### Task 14: Trials Tab

**Files:**
- Create: `src/components/dashboard/trial-funnel-chart.tsx`, `src/components/dashboard/speed-to-book-chart.tsx`, `src/components/dashboard/ltv-curve-chart.tsx`, `src/components/dashboard/tab-trials.tsx`

- [ ] **Step 1: Create trial funnel chart**

Create `src/components/dashboard/trial-funnel-chart.tsx`:

```tsx
"use client";

import type { TrialFunnelStats } from "@/lib/types";
import { formatMonthLabel, formatPercent, formatCurrency } from "@/lib/format";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface TrialFunnelChartProps {
  funnel: TrialFunnelStats;
}

export function TrialFunnelChart({ funnel }: TrialFunnelChartProps) {
  const monthData = funnel.byMonth.map((m) => ({
    label: formatMonthLabel(m.month),
    conversionRate: m.conversionRate * 100,
    trials: m.trials,
  }));

  const weekdayData = funnel.byWeekday.map((s) => ({
    ...s,
    conversionPct: s.conversionRate * 100,
  }));

  const timeData = funnel.byTime.map((s) => ({
    ...s,
    conversionPct: s.conversionRate * 100,
  }));

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold font-[family-name:var(--font-dm-sans)]">
            {funnel.totalTrials}
          </p>
          <p className="text-sm text-muted-foreground">Total Trials</p>
        </div>
        <div>
          <p className="text-2xl font-bold font-[family-name:var(--font-dm-sans)] text-[hsl(var(--preply-pink))]">
            {formatPercent(funnel.conversionRate)}
          </p>
          <p className="text-sm text-muted-foreground">Conversion Rate</p>
        </div>
        <div>
          <p className="text-2xl font-bold font-[family-name:var(--font-dm-sans)]">
            {funnel.converted}
          </p>
          <p className="text-sm text-muted-foreground">Converted</p>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2">Conversion by Month</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthData}>
              <XAxis dataKey="label" fontSize={11} />
              <YAxis tickFormatter={(v) => `${v}%`} fontSize={12} />
              <Tooltip
                formatter={(value: number) => [`${value.toFixed(1)}%`, "Conversion"]}
              />
              <Bar
                dataKey="conversionRate"
                fill="hsl(330, 85%, 66%)"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-medium mb-2">By Weekday</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekdayData}>
                <XAxis dataKey="slot" fontSize={11} />
                <YAxis tickFormatter={(v) => `${v}%`} fontSize={12} />
                <Tooltip
                  formatter={(value: number, name: string) => {
                    if (name === "conversionPct") return [`${value.toFixed(1)}%`, "Conversion"];
                    return [formatCurrency(value), "Avg LTV"];
                  }}
                />
                <Legend />
                <Bar
                  dataKey="conversionPct"
                  name="Conversion %"
                  fill="hsl(330, 85%, 66%)"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium mb-2">By Time of Day</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeData}>
                <XAxis dataKey="slot" fontSize={11} />
                <YAxis tickFormatter={(v) => `${v}%`} fontSize={12} />
                <Tooltip
                  formatter={(value: number) => [`${value.toFixed(1)}%`, "Conversion"]}
                />
                <Bar
                  dataKey="conversionPct"
                  fill="hsl(330, 85%, 66%)"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create speed-to-book chart**

Create `src/components/dashboard/speed-to-book-chart.tsx`:

```tsx
"use client";

import type { DelayBucket } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface SpeedToBookChartProps {
  buckets: DelayBucket[];
}

export function SpeedToBookChart({ buckets }: SpeedToBookChartProps) {
  const chartData = buckets.filter((b) => b.students > 0);

  return (
    <div className="space-y-4">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="bucket" fontSize={12} />
            <YAxis yAxisId="left" fontSize={12} />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickFormatter={(v) => `$${v}`}
              fontSize={12}
            />
            <Tooltip
              formatter={(value: number, name: string) => {
                if (name === "Avg Paid Lessons") return [value.toFixed(1), name];
                return [formatCurrency(value), name];
              }}
            />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="avgPaidLessons"
              name="Avg Paid Lessons"
              fill="hsl(330, 85%, 66%)"
              radius={[2, 2, 0, 0]}
            />
            <Bar
              yAxisId="right"
              dataKey="avgLifetimeEarnings"
              name="Avg Lifetime Earnings"
              fill="hsl(210, 40%, 60%)"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-sm text-muted-foreground">
        Time between trial and first paid lesson. Faster rebooking correlates
        with higher lifetime value.
      </p>
    </div>
  );
}
```

- [ ] **Step 3: Create LTV curve chart**

Create `src/components/dashboard/ltv-curve-chart.tsx`:

```tsx
"use client";

import type { LTVPoint } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface LTVCurveChartProps {
  data: LTVPoint[];
}

export function LTVCurveChart({ data }: LTVCurveChartProps) {
  return (
    <div className="space-y-4">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis
              dataKey="lessonNumber"
              label={{
                value: "Lesson #",
                position: "insideBottom",
                offset: -5,
              }}
              fontSize={12}
            />
            <YAxis
              tickFormatter={(v) => `$${v}`}
              label={{
                value: "Avg Cumulative Earnings",
                angle: -90,
                position: "insideLeft",
              }}
              fontSize={12}
            />
            <Tooltip
              formatter={(value: number, _name: string, props: { payload: LTVPoint }) => [
                `${formatCurrency(value)} (${props.payload.studentCount} students at this point)`,
                "Avg Cumulative Earnings",
              ]}
            />
            <Line
              dataKey="avgCumulativeEarnings"
              stroke="hsl(330, 85%, 66%)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="text-sm text-muted-foreground">
        Average cumulative earnings per student by lesson number. The steeper
        the curve, the more each additional lesson is worth.
      </p>
    </div>
  );
}
```

- [ ] **Step 4: Create trials tab**

Create `src/components/dashboard/tab-trials.tsx`:

```tsx
"use client";

import type { ProcessedData } from "@/lib/types";
import { checkThreshold } from "@/lib/thresholds";
import { ThresholdGate } from "./threshold-gate";
import { TrialFunnelChart } from "./trial-funnel-chart";
import { SpeedToBookChart } from "./speed-to-book-chart";
import { LTVCurveChart } from "./ltv-curve-chart";

interface TabTrialsProps {
  data: ProcessedData;
}

export function TabTrials({ data }: TabTrialsProps) {
  const funnelThreshold = checkThreshold("trialFunnel", data);
  const speedThreshold = checkThreshold("speedToBook", data);
  const ltvThreshold = checkThreshold("ltvCurve", data);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold font-[family-name:var(--font-dm-sans)] mb-4">
          Trial Funnel
        </h2>
        <ThresholdGate threshold={funnelThreshold}>
          <TrialFunnelChart funnel={data.trialFunnel} />
        </ThresholdGate>
      </div>

      <div>
        <h2 className="text-lg font-semibold font-[family-name:var(--font-dm-sans)] mb-4">
          Speed to Book
        </h2>
        <ThresholdGate threshold={speedThreshold}>
          <SpeedToBookChart buckets={data.trialFunnel.delayBuckets} />
        </ThresholdGate>
      </div>

      <div>
        <h2 className="text-lg font-semibold font-[family-name:var(--font-dm-sans)] mb-4">
          Student Lifetime Value Curve
        </h2>
        <ThresholdGate threshold={ltvThreshold}>
          <LTVCurveChart data={data.ltvCurve} />
        </ThresholdGate>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

Run:
```bash
git add src/components/dashboard/trial-funnel-chart.tsx src/components/dashboard/speed-to-book-chart.tsx src/components/dashboard/ltv-curve-chart.tsx src/components/dashboard/tab-trials.tsx
git commit -m "feat: add Trials tab with funnel charts, speed-to-book analysis, and LTV curve"
```

---

### Task 15: Take Action Tab

**Files:**
- Create: `src/components/dashboard/reactivation-list.tsx`, `src/components/dashboard/pricing-table.tsx`, `src/components/dashboard/scheduling-chart.tsx`, `src/components/dashboard/tab-actions.tsx`

- [ ] **Step 1: Create reactivation list**

Create `src/components/dashboard/reactivation-list.tsx`:

```tsx
"use client";

import type { ReactivationCandidate } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/format";
import { Card } from "@/components/ui/card";

interface ReactivationListProps {
  candidates: ReactivationCandidate[];
}

export function ReactivationList({ candidates }: ReactivationListProps) {
  if (candidates.length === 0) {
    return (
      <p className="text-muted-foreground">
        No reactivation candidates found. All your regulars are still active!
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Former students who took 5+ lessons and have gone quiet. These are warm
        leads — they already know and liked your teaching.
      </p>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {candidates.slice(0, 12).map((c) => (
          <Card key={c.student} className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">{c.student}</p>
                <p className="text-sm text-muted-foreground">
                  {c.studentLocation}
                </p>
              </div>
              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                {c.daysSinceLast}d ago
              </span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
              <div>
                <p className="font-medium">{c.paidLessons}</p>
                <p className="text-xs text-muted-foreground">Lessons</p>
              </div>
              <div>
                <p className="font-medium">{formatCurrency(c.earningsUSD)}</p>
                <p className="text-xs text-muted-foreground">Earned</p>
              </div>
              <div>
                <p className="font-medium">
                  {formatCurrency(c.lastPaidPriceUSD)}
                </p>
                <p className="text-xs text-muted-foreground">Last Rate</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
      {candidates.length > 12 && (
        <p className="text-sm text-muted-foreground">
          Showing top 12 of {candidates.length} candidates.
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create pricing table**

Create `src/components/dashboard/pricing-table.tsx`:

```tsx
"use client";

import type { PricingOpportunity } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PricingTableProps {
  opportunities: PricingOpportunity[];
}

export function PricingTable({ opportunities }: PricingTableProps) {
  if (opportunities.length === 0) {
    return (
      <p className="text-muted-foreground">
        No pricing opportunities found. Your active students are at or above
        your median rate.
      </p>
    );
  }

  const totalUplift10 = opportunities.reduce(
    (s, p) => s + p.monthlyUplift10,
    0
  );

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Active students on rates below your current median. A $10 increase
        across this group would add ~{formatCurrency(totalUplift10)}/month.
      </p>
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">Total Lessons</TableHead>
              <TableHead className="text-right">Current Rate</TableHead>
              <TableHead className="text-right">Lessons (90d)</TableHead>
              <TableHead className="text-right">+$5/mo</TableHead>
              <TableHead className="text-right">+$10/mo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {opportunities.map((p) => (
              <TableRow key={p.student}>
                <TableCell className="font-medium">{p.student}</TableCell>
                <TableCell>{p.studentLocation}</TableCell>
                <TableCell className="text-right">{p.paidLessons}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(p.lastPaidPriceUSD)}
                </TableCell>
                <TableCell className="text-right">{p.lessons90d}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(p.monthlyUplift5)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(p.monthlyUplift10)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create scheduling chart**

Create `src/components/dashboard/scheduling-chart.tsx`:

```tsx
"use client";

import type { SchedulingStats } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface SchedulingChartProps {
  scheduling: SchedulingStats;
}

export function SchedulingChart({ scheduling }: SchedulingChartProps) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-medium mb-2">By Weekday</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={scheduling.byWeekday}>
              <XAxis dataKey="slot" fontSize={11} />
              <YAxis yAxisId="left" fontSize={12} />
              <YAxis
                yAxisId="right"
                orientation="right"
                tickFormatter={(v) => `$${v}`}
                fontSize={12}
              />
              <Tooltip
                formatter={(value: number, name: string) => {
                  if (name === "Avg Price") return [formatCurrency(value), name];
                  return [value, name];
                }}
              />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="paidLessons"
                name="Paid Lessons"
                fill="hsl(330, 85%, 66%)"
                radius={[2, 2, 0, 0]}
              />
              <Bar
                yAxisId="right"
                dataKey="avgPriceUSD"
                name="Avg Price"
                fill="hsl(210, 40%, 60%)"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2">By Time of Day</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={scheduling.byTime}>
              <XAxis dataKey="slot" fontSize={11} />
              <YAxis yAxisId="left" fontSize={12} />
              <YAxis
                yAxisId="right"
                orientation="right"
                tickFormatter={(v) => `$${v}`}
                fontSize={12}
              />
              <Tooltip
                formatter={(value: number, name: string) => {
                  if (name === "Avg Price") return [formatCurrency(value), name];
                  return [value, name];
                }}
              />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="paidLessons"
                name="Paid Lessons"
                fill="hsl(330, 85%, 66%)"
                radius={[2, 2, 0, 0]}
              />
              <Bar
                yAxisId="right"
                dataKey="avgPriceUSD"
                name="Avg Price"
                fill="hsl(210, 40%, 60%)"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create take action tab**

Create `src/components/dashboard/tab-actions.tsx`:

```tsx
"use client";

import type { ProcessedData } from "@/lib/types";
import { checkThreshold } from "@/lib/thresholds";
import { ThresholdGate } from "./threshold-gate";
import { ReactivationList } from "./reactivation-list";
import { PricingTable } from "./pricing-table";
import { SchedulingChart } from "./scheduling-chart";

interface TabActionsProps {
  data: ProcessedData;
}

export function TabActions({ data }: TabActionsProps) {
  const reactivationThreshold = checkThreshold("reactivation", data);
  const pricingThreshold = checkThreshold("pricing", data);
  const schedulingThreshold = checkThreshold("scheduling", data);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold font-[family-name:var(--font-dm-sans)] mb-4">
          Reactivation Opportunities
        </h2>
        <ThresholdGate threshold={reactivationThreshold}>
          <ReactivationList candidates={data.reactivation} />
        </ThresholdGate>
      </div>

      <div>
        <h2 className="text-lg font-semibold font-[family-name:var(--font-dm-sans)] mb-4">
          Pricing Opportunities
        </h2>
        <ThresholdGate threshold={pricingThreshold}>
          <PricingTable opportunities={data.pricingOpportunities} />
        </ThresholdGate>
      </div>

      <div>
        <h2 className="text-lg font-semibold font-[family-name:var(--font-dm-sans)] mb-4">
          Scheduling Patterns
        </h2>
        <ThresholdGate threshold={schedulingThreshold}>
          <SchedulingChart scheduling={data.scheduling} />
        </ThresholdGate>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

Run:
```bash
git add src/components/dashboard/reactivation-list.tsx src/components/dashboard/pricing-table.tsx src/components/dashboard/scheduling-chart.tsx src/components/dashboard/tab-actions.tsx
git commit -m "feat: add Take Action tab with reactivation list, pricing opportunities, and scheduling patterns"
```

---

### Task 16: Landing Page

**Files:**
- Create: `src/components/landing/hero.tsx`, `src/components/landing/demo-section.tsx`, `src/components/landing/how-it-works.tsx`, `src/components/landing/upload-section.tsx`, `src/components/landing/footer.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Create hero section**

Create `src/components/landing/hero.tsx`:

```tsx
export function Hero() {
  return (
    <section className="py-20 px-4 text-center max-w-3xl mx-auto">
      <h1 className="text-4xl md:text-5xl font-bold font-[family-name:var(--font-dm-sans)] leading-tight">
        See what 2,000+ hours on Preply actually taught me about the{" "}
        <span className="text-[hsl(var(--preply-pink))]">business side</span>
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Made by a Preply tutor, for Preply tutors
      </p>
      <p className="mt-6 text-base text-muted-foreground max-w-xl mx-auto">
        Most tutors obsess over getting more trials. But the real levers are
        retention, pricing, speed-to-rebook, and knowing where your income
        actually comes from. Upload your Preply data and see it all in seconds.
      </p>
      <a
        href="#upload"
        className="mt-8 inline-block bg-[hsl(var(--preply-pink))] hover:bg-[hsl(var(--preply-pink-dark))] text-white font-medium px-8 py-3 rounded-lg transition-colors text-lg"
      >
        Analyze Your Data
      </a>
    </section>
  );
}
```

- [ ] **Step 2: Create demo section**

Create `src/components/landing/demo-section.tsx`:

```tsx
"use client";

import { useEffect } from "react";
import { useData } from "@/context/data-context";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { TabOverview } from "@/components/dashboard/tab-overview";
import { TabStudents } from "@/components/dashboard/tab-students";
import { TabGrowth } from "@/components/dashboard/tab-growth";
import { TabTrials } from "@/components/dashboard/tab-trials";
import { TabActions } from "@/components/dashboard/tab-actions";

export function DemoSection() {
  const { data, loadDemo, isLoading } = useData();

  useEffect(() => {
    loadDemo();
  }, [loadDemo]);

  if (isLoading || !data) {
    return (
      <section className="py-12 px-4">
        <div className="text-center text-muted-foreground">
          Loading demo dashboard...
        </div>
      </section>
    );
  }

  return (
    <section className="py-12">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold font-[family-name:var(--font-dm-sans)]">
          See what you&apos;ll get
        </h2>
        <p className="text-muted-foreground mt-2">
          Explore a sample dashboard with anonymized data
        </p>
      </div>
      <DashboardLayout
        demoBanner
        tabs={{
          overview: <TabOverview data={data} />,
          students: <TabStudents data={data} />,
          growth: <TabGrowth data={data} />,
          trials: <TabTrials data={data} />,
          actions: <TabActions data={data} />,
        }}
      />
    </section>
  );
}
```

- [ ] **Step 3: Create how-it-works section**

Create `src/components/landing/how-it-works.tsx`:

```tsx
const STEPS = [
  {
    number: "1",
    title: "Export your data",
    description:
      "Go to your Preply tutor dashboard and export your activity report as a CSV file.",
  },
  {
    number: "2",
    title: "Upload it here",
    description:
      "Drop your CSV into PreplyPulse. Your data never leaves your browser.",
  },
  {
    number: "3",
    title: "See your insights",
    description:
      "Get a personalized dashboard with actionable business insights in seconds.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold font-[family-name:var(--font-dm-sans)] text-center mb-12">
          How it works
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {STEPS.map((step) => (
            <div key={step.number} className="text-center">
              <div className="w-12 h-12 rounded-full bg-[hsl(var(--preply-pink))] text-white flex items-center justify-center mx-auto text-xl font-bold font-[family-name:var(--font-dm-sans)]">
                {step.number}
              </div>
              <h3 className="mt-4 font-semibold font-[family-name:var(--font-dm-sans)]">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Create upload section**

Create `src/components/landing/upload-section.tsx`:

```tsx
import { CSVUploader } from "@/components/upload/csv-uploader";

export function UploadSection() {
  return (
    <section id="upload" className="py-16 px-4">
      <div className="max-w-xl mx-auto">
        <h2 className="text-2xl font-bold font-[family-name:var(--font-dm-sans)] text-center mb-8">
          Ready to see your data?
        </h2>
        <CSVUploader />
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Create footer**

Create `src/components/landing/footer.tsx`:

```tsx
export function Footer() {
  return (
    <footer className="py-12 px-4 border-t bg-white">
      <div className="max-w-3xl mx-auto text-center space-y-4">
        <p className="text-sm text-muted-foreground">
          Built by Megan B. — a Preply tutor who spent 2,118 hours learning the
          business side so you don&apos;t have to.
        </p>
        <div className="flex items-center justify-center gap-6 text-sm">
          <a
            href="https://buymeacoffee.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[hsl(var(--preply-pink))] hover:underline"
          >
            If this helped, buy me a coffee
          </a>
          <span className="text-muted-foreground">·</span>
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:underline"
          >
            Read the original Reddit post
          </a>
        </div>
        <p className="text-xs text-muted-foreground">
          PreplyPulse is not affiliated with Preply. Your data is processed
          entirely in your browser and is never sent to any server.
        </p>
      </div>
    </footer>
  );
}
```

- [ ] **Step 6: Assemble the landing page**

Replace the contents of `src/app/page.tsx`:

```tsx
import { Hero } from "@/components/landing/hero";
import { DemoSection } from "@/components/landing/demo-section";
import { HowItWorks } from "@/components/landing/how-it-works";
import { UploadSection } from "@/components/landing/upload-section";
import { Footer } from "@/components/landing/footer";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <DemoSection />
      <HowItWorks />
      <UploadSection />
      <Footer />
    </main>
  );
}
```

- [ ] **Step 7: Commit**

Run:
```bash
git add src/components/landing/ src/app/page.tsx
git commit -m "feat: add landing page with hero, demo dashboard, how-it-works, upload section, and footer"
```

---

### Task 17: Dashboard Page

**Files:**
- Create: `src/app/dashboard/page.tsx`

- [ ] **Step 1: Create the dashboard page**

Create `src/app/dashboard/page.tsx`:

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useData } from "@/context/data-context";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { TabOverview } from "@/components/dashboard/tab-overview";
import { TabStudents } from "@/components/dashboard/tab-students";
import { TabGrowth } from "@/components/dashboard/tab-growth";
import { TabTrials } from "@/components/dashboard/tab-trials";
import { TabActions } from "@/components/dashboard/tab-actions";
import { useEffect } from "react";

export default function DashboardPage() {
  const { data, isDemo } = useData();
  const router = useRouter();

  useEffect(() => {
    if (!data) {
      router.push("/");
    }
  }, [data, router]);

  if (!data) {
    return null;
  }

  return (
    <DashboardLayout
      demoBanner={isDemo}
      tabs={{
        overview: <TabOverview data={data} />,
        students: <TabStudents data={data} />,
        growth: <TabGrowth data={data} />,
        trials: <TabTrials data={data} />,
        actions: <TabActions data={data} />,
      }}
    />
  );
}
```

- [ ] **Step 2: Commit**

Run:
```bash
git add src/app/dashboard/page.tsx
git commit -m "feat: add dashboard page with redirect guard and all tab views"
```

---

### Task 18: Integration Testing and Final Verification

**Files:**
- No new files

- [ ] **Step 1: Run all unit tests**

Run:
```bash
npm test
```

Expected: All tests PASS.

- [ ] **Step 2: Run TypeScript type check**

Run:
```bash
npx tsc --noEmit
```

Expected: No type errors.

- [ ] **Step 3: Run the linter**

Run:
```bash
npm run lint
```

Expected: No lint errors (or only minor warnings).

- [ ] **Step 4: Start the dev server and test manually**

Run:
```bash
npm run dev
```

Test the following in the browser at `http://localhost:3000`:

1. Landing page loads with hero, demo dashboard, how-it-works, upload section, footer
2. Demo dashboard renders with mock data and demo banner
3. All 5 tabs in the demo are clickable and show data
4. Upload the real CSV file (`tutor_report_5385154 (2).csv`) via drag-and-drop or file picker
5. Dashboard redirects to `/dashboard` with real data
6. All 5 tabs show correct data from the real CSV
7. Student table is searchable and sortable
8. Health badges show green/yellow/red correctly
9. Charts render without errors
10. "Upload New File" button returns to landing page
11. "Download Report" captures a PNG
12. Threshold gates show friendly messages for views that need more data (test with a small CSV if possible)

- [ ] **Step 5: Build for production**

Run:
```bash
npm run build
```

Expected: Build completes without errors.

- [ ] **Step 6: Final commit**

Run:
```bash
git add -A
git commit -m "chore: fix any remaining lint, type, or build issues"
```

This commit is only needed if steps 1-5 required any fixes. If everything passed cleanly, skip this step.
