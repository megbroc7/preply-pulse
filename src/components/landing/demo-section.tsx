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
      <section className="py-12 px-4">
        <div className="text-center text-muted-foreground">Loading demo dashboard...</div>
      </section>
    );
  }

  return (
    <section className="py-12">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold font-[family-name:var(--font-dm-sans)]">See what you&apos;ll get</h2>
        <p className="text-muted-foreground mt-2">Explore a sample dashboard with anonymized data</p>
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
