# PreplyPulse — Design Spec

**Date:** 2026-04-17
**Author:** Megan B. + Claude
**Status:** Draft

## What This Is

PreplyPulse is a free, client-side web app that lets Preply tutors upload their activity CSV and instantly see actionable business insights. No accounts, no server storage, no data leaves the browser.

**Tagline:** "Made by a Preply tutor, for Preply tutors"

**Audience:** Preply tutors who want to understand and optimize their tutoring business but aren't going to build their own spreadsheet.

**Monetization:** Free with a donate button (Ko-fi or Buy Me a Coffee). Future option for freemium tier or consulting leads — architecture supports adding server features later as opt-in.

## Tech Stack

- **Framework:** Next.js (App Router), deployed on Vercel
- **Styling:** Tailwind CSS + shadcn/ui
- **Charts:** Recharts
- **CSV Parsing:** Papa Parse (client-side)
- **Fonts:** DM Sans (headings), Inter (body/data)
- **Report Export:** html2canvas or similar for PDF/PNG download

## Pages and User Flow

### Landing Page (`/`)

1. **Hero section**
   - Headline: "See what 2,000+ hours on Preply actually taught me about the business side"
   - Subline: "Made by a Preply tutor, for Preply tutors"
   - 2-3 sentence summary of the thesis: most tutors obsess over trials but the real levers are retention, pricing, speed-to-rebook, and knowing where your income actually comes from
   - CTA button: "Analyze Your Data" (pink, scrolls to upload section)

2. **Demo dashboard**
   - "See what you'll get" header
   - Interactive sample dashboard rendered with anonymized mock data — same components as the real dashboard
   - Tutors can click through tabs and explore before committing to upload
   - Banner: "This is sample data. Upload yours to see your real insights."

3. **How it works**
   - Step 1: "Go to your Preply tutor dashboard and export your activity report as CSV"
   - Step 2: "Upload it here — your data never leaves your browser"
   - Step 3: "Get your personalized insights in seconds"
   - Include a screenshot or guide showing where to find the export in Preply's UI

4. **Upload section**
   - Drag-and-drop zone with file picker fallback
   - Privacy badge: "100% private — processed in your browser, never sent to any server"
   - On successful parse, navigates to `/dashboard`

5. **Footer**
   - "Built by Megan B."
   - Donate button: "If this helped, buy me a coffee"
   - Link to the original Reddit post

### Dashboard Page (`/dashboard`)

Reached after successful CSV upload. File is stored in React state (browser memory only). Tabbed layout with 5 tabs.

## Dashboard Structure

### Tab 1: Overview

- **KPI cards:** Total students, total lessons, total earnings, avg lesson price, trial conversion rate, students active in last 30 days
- **"What stands out" callouts:** Auto-generated plain-English insights based on the tutor's data (rule-based engine, see Data Processing section)

### Tab 2: Students

- **Student Summary table:** Sortable and searchable. One row per student with: name, location, total paid lessons, total earnings, first lesson, last lesson, days since last, avg price, last price, active status, health score badge.
- **Student Health Score:** Red/yellow/green indicator per student based on RFM scoring (see calculation details below). Helps tutors spot at-risk students before they churn.
- **Concentration Risk:** Visual showing what % of earnings the top 5 and top 10 students represent. Warning callout if concentration is dangerously high (e.g., top 5 > 50%).

### Tab 3: Growth

- **Monthly Trends:** Line/bar charts for active students, paid lessons, earnings, and avg price over time.
- **Seasonality Patterns:** Chart showing monthly volume normalized against the tutor's average, highlighting predictable peaks and dips.
- **Revenue Forecast:** Projects next 30/60/90 day earnings based on active students and recent cadence. Shows conservative (80%) and optimistic (110%) bands as an area chart.

### Tab 4: Trials

- **Trial Funnel:** Conversion rates overall, by month, by weekday, by time slot.
- **Speed to Book:** Delay-bucket analysis showing avg paid lessons and LTV by how fast students rebook after trial. Buckets: ≤1d, 1-3d, 3-7d, 7-14d, 14d+.
- **LTV Curve:** Cumulative earnings plotted by lesson number, averaged across all students who reached that lesson count. Shows where the "payoff" happens and the critical retention window.

### Tab 5: Take Action

- **Reactivation List:** Dormant students (no lesson in 90+ days) who previously took 5+ paid lessons, sorted by prior engagement. Ready-made outreach list.
- **Pricing Opportunities:** Active students on below-market rates (below tutor's current median) with modeled monthly uplift from $5 and $10 increases based on recent 90-day cadence.
- **Scheduling Patterns:** All lessons broken by weekday and time bucket, showing volume, earnings, and avg price per slot.

## Data Processing

### CSV Input Schema

Expected columns from Preply tutor activity export:

| Column | Example |
|--------|---------|
| Service Type | Preply Marketplace |
| Student | Amengeh A. |
| Student Location | Nigeria |
| Lesson Date | 9/24/24 14:00 |
| Date Confirmed | 9/24/24 15:28 |
| Type | Trial / Non-trial lesson |
| Lesson Price, USD | 15 |
| Tutor Payout, % | 67 (or `-` for trials) |
| Earning, USD | 10.05 (or `-` for trials) |

### Validation

- Check all expected columns exist
- If missing or malformed: clear error with guidance ("Make sure you're uploading the tutor activity report from Preply, not a different export")
- Handle edge cases: dash (`-`) values for trial earnings/payout, empty student names, inconsistent date formats

### Derived Data Structures

All computed from the raw CSV rows and stored in React state:

- **`students[]`** — Grouped by student name. Fields: lesson count, trials, paid lessons, gross sales, earnings, first/last lesson date, days active, days since last, avg paid price, last paid price, trial-to-first-paid gap (days), health score, active-in-30d flag.
- **`monthlyTrends[]`** — Aggregated by month: new students, active students, trials, paid lessons, gross sales, earnings, avg price, earnings per active student.
- **`trialFunnel`** — Trial students with conversion status, delay buckets, weekday/time breakdowns, LTV per bucket.
- **`scheduling`** — All lessons by weekday and time bucket with volume, earnings, avg price, student count.
- **`reactivation[]`** — Students with 5+ paid lessons and no lesson in 90+ days, sorted by paid lesson count descending.
- **`pricingOpportunities[]`** — Active students with last paid price below tutor's current median, filtered to those with 4+ lessons in last 90 days. Includes modeled monthly uplift.

### Computed Insights

**Health Score (RFM)**
- Recency (40% weight): days since last lesson. Green ≤ 14 days, yellow 15-45 days, red > 45 days.
- Frequency (35% weight): lessons per month over last 90 days. Green ≥ 4/month, yellow 2-3/month, red < 2/month.
- Monetary (25% weight): avg lesson price relative to tutor's median. Green ≥ median, yellow 75-99% of median, red < 75% of median.
- Composite: weighted average mapped to green (≥ 0.7), yellow (0.4-0.69), red (< 0.4).

**Revenue Forecast**
- For each student active in the last 30 days: calculate their average lessons/month over the last 90 days, multiply by their current (last) price.
- Sum across all active students for monthly projection.
- Conservative band: 80% of projection. Optimistic band: 110%.
- Extrapolate to 30/60/90 day totals.

**Seasonality**
- For each month in the tutor's history: calculate total paid lessons.
- Normalize against the tutor's overall monthly average (value of 1.0 = average month).
- Display as relative index so tutors see which months run hot or cold.

**LTV Curve**
- For each student, compute cumulative earnings at lesson 1, lesson 2, ..., lesson N.
- At each lesson number, average across all students who reached that point.
- Plot as a line chart. X-axis = lesson number, Y-axis = average cumulative earnings.

**"What Stands Out" Engine**
- Rule-based checks that scan computed data and surface plain-English callouts. Examples:
  - Trial conversion rate relative to the tutor's own trend (improving, declining, stable)
  - Speed-to-book correlation with LTV
  - Concentration risk level
  - Legacy pricing drag (students on rates well below current average)
  - Reactivation opportunity size
  - Revenue trend direction (growing, flat, declining)

### Progressive Disclosure Thresholds

Not all views are reliable with small data sets. Each view has a minimum data requirement:

| View | Minimum Requirement |
|------|---------------------|
| Overview KPIs, Student Summary, Scheduling | 30 paid lessons |
| Trial Funnel, Speed-to-Book | 20 trials |
| Monthly Trends, Concentration Risk | 3 months of history + 10 students |
| Health Scores, Reactivation, Pricing | 50 paid lessons over 3+ months |
| LTV Curve, Revenue Forecast | 100 paid lessons over 4+ months |
| Seasonality | 6+ months of history |

Views that don't meet their threshold show a friendly message explaining what's needed: "You'll unlock this view after X more months of data" or "This needs 20+ trials to be meaningful."

## UI Design

### Color System

- **Primary accent (Preply pink):** Primary buttons, active tab indicators, links, hero section accent, primary chart series
- **Background:** Near-white / light gray for page and card backgrounds
- **Text:** Dark charcoal for body text and table headers
- **Chart palette:** Pink as primary series, then complementary muted tones (slate blue, soft teal, warm gray) for secondary series
- **Health scores:** Semantic colors independent of brand — green, yellow, red

### Typography

- **Headings:** DM Sans — geometric, slightly rounded, warm and approachable
- **Body/data:** Inter — highly legible at small sizes, tabular number support for aligned data columns

### Responsive Behavior

- Desktop-first design (tutors will mostly use this on a laptop)
- Mobile-responsive — tables become scrollable, charts resize, tabs may stack

### Key Components

| Component | Purpose |
|-----------|---------|
| `CSVUploader` | Drag-and-drop zone with file picker fallback and validation feedback |
| `DashboardLayout` | Tab navigation + header with "Upload new file" and "Download report" actions |
| `KPICard` | Reusable metric card: value, label, optional trend indicator |
| `InsightCallout` | Plain-English "what stands out" boxes |
| `StudentTable` | Sortable, searchable, with health score badges |
| `ChartPanel` | Wrapper for Recharts with consistent sizing, tooltips, and empty states |
| `ReactivationList` | Card-based list emphasizing outreach opportunity |
| `PricingTable` | Current rate, modeled uplift, recent cadence |
| `RevenueForecast` | Area chart with conservative/optimistic bands |
| `LTVCurve` | Line chart, cumulative earnings by lesson number |
| `SeasonalityChart` | Bar chart showing monthly relative volume |
| `DemoToggle` | Renders dashboard components with mock data (landing) or real data (dashboard) |

### Download Report

- html2canvas or similar to capture dashboard as PDF/PNG
- Gives tutors something shareable without persistence

### Error and Empty States

- Missing columns: specific guidance on which Preply export to use
- Not enough data: friendly per-view messages with thresholds (see Progressive Disclosure)
- Edge cases: single-student scenarios handled gracefully (e.g., concentration risk doesn't warn with < 5 students)

## Architecture Notes

- All processing is client-side in v1 — no API routes, no database, no auth
- Data lives in React state/context for the session duration; lost on tab close
- Architecture supports future server features as opt-in additions:
  - Saved reports (add auth + database)
  - Historical tracking (upload monthly, compare over time)
  - Community benchmarks (anonymized aggregate data)
  - These would be added as API routes in the existing Next.js project
