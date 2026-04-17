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
    if (!data) { router.push("/"); }
  }, [data, router]);

  if (!data) { return null; }

  return (
    <DashboardLayout demoBanner={isDemo} tabs={{
      overview: <TabOverview data={data} />,
      students: <TabStudents data={data} />,
      growth: <TabGrowth data={data} />,
      trials: <TabTrials data={data} />,
      actions: <TabActions data={data} />,
    }} />
  );
}
