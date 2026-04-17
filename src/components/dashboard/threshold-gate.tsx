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
      <p className="text-muted-foreground max-w-md mx-auto">{threshold.message}</p>
    </Card>
  );
}
