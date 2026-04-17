import { Badge } from "@/components/ui/badge";
import type { HealthScore } from "@/lib/types";

const VARIANTS: Record<HealthScore["label"], string> = {
  Healthy: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100",
  "At Risk": "bg-amber-100 text-amber-800 hover:bg-amber-100",
  Fading: "bg-red-100 text-red-800 hover:bg-red-100",
};

export function HealthBadge({ label }: { label: HealthScore["label"] }) {
  return <Badge variant="secondary" className={VARIANTS[label]}>{label}</Badge>;
}
