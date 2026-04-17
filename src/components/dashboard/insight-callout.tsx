import type { InsightCallout as InsightCalloutType } from "@/lib/types";

const STYLES = {
  info: "bg-blue-50 border-blue-200 text-blue-900",
  warning: "bg-amber-50 border-amber-200 text-amber-900",
  success: "bg-emerald-50 border-emerald-200 text-emerald-900",
  purple: "bg-purple-50 border-purple-200 text-purple-900",
};

export function InsightCallout({ title, body, type }: InsightCalloutType) {
  return (
    <div className={`rounded-lg border p-4 ${STYLES[type]}`}>
      <p className="font-medium font-[family-name:var(--font-dm-sans)]">{title}</p>
      <p className="text-sm mt-1 opacity-90">{body}</p>
    </div>
  );
}
