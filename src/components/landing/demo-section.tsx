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

  useEffect(() => { loadDemo(); }, [loadDemo]);

  if (isLoading || !data) {
    return (
      <section className="py-16 px-4">
        <div className="flex items-center justify-center gap-2 text-gray-400">
          <div className="w-4 h-4 rounded-full border-2 border-pink-200 border-t-[hsl(var(--preply-pink))] animate-spin" />
          Loading demo...
        </div>
      </section>
    );
  }

  return (
    <section id="demo" className="py-16">
      <div className="text-center mb-10">
        <p className="text-[13px] font-medium tracking-widest uppercase text-[hsl(var(--preply-pink))] mb-3">
          Live preview
        </p>
        <h2 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-dm-sans)]">
          See what you&apos;ll get
        </h2>
        <p className="text-gray-400 mt-2 text-sm">
          This is anonymized sample data. Upload yours for the real thing.
        </p>
      </div>
      <DashboardLayout demoBanner tabs={{
        overview: <TabOverview data={data} />,
        students: <TabStudents data={data} />,
        growth: <TabGrowth data={data} />,
        trials: <TabTrials data={data} />,
        actions: <TabActions data={data} />,
      }} />
    </section>
  );
}
