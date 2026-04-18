"use client";

import { useEffect } from "react";
import { track } from "@vercel/analytics/react";
import { useData } from "@/context/data-context";
import { useLocale } from "@/context/locale-context";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { TabOverview } from "@/components/dashboard/tab-overview";
import { TabStudents } from "@/components/dashboard/tab-students";
import { TabGrowth } from "@/components/dashboard/tab-growth";
import { TabTrials } from "@/components/dashboard/tab-trials";
import { TabActions } from "@/components/dashboard/tab-actions";

export function DemoSection() {
  const { data, loadDemo, isLoading, didReset } = useData();
  const { t } = useLocale();

  useEffect(() => {
    if (!didReset) loadDemo();
  }, [loadDemo, didReset]);

  if (didReset || isLoading || !data) {
    if (didReset) return null;
    return (
      <section className="py-16 px-4">
        <div className="flex items-center justify-center gap-2 text-gray-400">
          <div className="w-4 h-4 rounded-full border-2 border-pink-200 border-t-[hsl(var(--preply-pink))] animate-spin" />
          Loading...
        </div>
      </section>
    );
  }

  return (
    <section id="demo" className="py-16">
      <div className="text-center mb-10">
        <p className="text-[13px] font-medium tracking-widest uppercase text-[hsl(var(--preply-pink))] mb-3">
          {t("demoLabel")}
        </p>
        <h2 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-dm-sans)]">
          {t("demoTitle")}
        </h2>
        <p className="text-gray-400 mt-2 text-sm">{t("demoSubtitle")}</p>
      </div>
      <DashboardLayout demoBanner tabs={{
        overview: <TabOverview data={data} />,
        students: <TabStudents data={data} />,
        growth: <TabGrowth data={data} />,
        trials: <TabTrials data={data} />,
        actions: <TabActions data={data} />,
      }} />
      <div className="max-w-xl mx-auto text-center mt-12 px-4">
        <p className="text-gray-500 text-sm leading-relaxed">
          {t("demoEspresso")}{" "}
          <a
            href="https://buymeacoffee.com/preplypulse"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("espresso_clicked", { location: "demo_section" })}
            className="text-amber-600 hover:text-amber-700 font-medium transition-colors"
          >
            {t("demoEspressoLink")}
          </a>{" "}
          {t("demoEspressoEnd")}
        </p>
      </div>
    </section>
  );
}
