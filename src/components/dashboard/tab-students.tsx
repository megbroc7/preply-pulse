"use client";

import type { ProcessedData } from "@/lib/types";
import { checkThreshold } from "@/lib/thresholds";
import { ThresholdGate } from "./threshold-gate";
import { StudentTable } from "./student-table";
import { GeographicChart } from "./geographic-chart";
import { ConcentrationChart } from "./concentration-chart";

interface TabStudentsProps { data: ProcessedData; }

export function TabStudents({ data }: TabStudentsProps) {
  const healthThreshold = checkThreshold("healthScores", data);
  const concentrationThreshold = checkThreshold("concentrationRisk", data);
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold font-[family-name:var(--font-dm-sans)] mb-4">Student Summary</h2>
        <StudentTable students={data.students} showHealthScore={healthThreshold.met} />
      </div>
      <div>
        <h2 className="text-lg font-semibold font-[family-name:var(--font-dm-sans)] mb-4">Geographic Breakdown</h2>
        <ThresholdGate threshold={concentrationThreshold}>
          <GeographicChart students={data.students} totalEarnings={data.totalEarnings} />
        </ThresholdGate>
      </div>
      <div>
        <h2 className="text-lg font-semibold font-[family-name:var(--font-dm-sans)] mb-4">Concentration Risk</h2>
        <ThresholdGate threshold={concentrationThreshold}>
          <ConcentrationChart students={data.students} totalEarnings={data.totalEarnings} />
        </ThresholdGate>
      </div>
    </div>
  );
}
