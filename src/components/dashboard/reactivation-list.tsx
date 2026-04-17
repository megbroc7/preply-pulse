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
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No reactivation candidates</p>
      </Card>
    );
  }

  const shown = candidates.slice(0, 12);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        These are warm leads: students who completed paid lessons with you but have gone quiet. A
        short personal message can bring them back.
      </p>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {shown.map((c) => (
          <Card key={c.student} className="p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium leading-tight">{c.student}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{c.studentLocation}</p>
              </div>
              <span className="shrink-0 rounded-full bg-red-500 text-white text-xs font-semibold px-2 py-0.5">
                {c.daysSinceLast}d ago
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <p className="font-semibold text-sm">{c.paidLessons}</p>
                <p className="text-muted-foreground">Lessons</p>
              </div>
              <div>
                <p className="font-semibold text-sm">{formatCurrency(c.earningsUSD)}</p>
                <p className="text-muted-foreground">Earned</p>
              </div>
              <div>
                <p className="font-semibold text-sm">{formatCurrency(c.lastPaidPriceUSD)}</p>
                <p className="text-muted-foreground">Last Rate</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Last lesson: {formatDate(c.lastLesson)}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
