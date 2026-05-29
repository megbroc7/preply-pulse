"use client";

import { useLocale } from "@/context/locale-context";

export function CSVGuide({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const { t } = useLocale();

  const steps = [
    { number: 1, title: t("guideStep1Title"), description: t("guideStep1Desc"), image: "/guide/step-1-insights.png" },
    { number: 2, title: t("guideStep2Title"), description: t("guideStep2Desc"), image: "/guide/step-2-earnings.png" },
    { number: 3, title: t("guideStep3Title"), description: t("guideStep3Desc"), image: "/guide/step-3-download.png" },
  ];

  return (
    <div id="csv-guide" className="mt-6 scroll-mt-24">
      <button
        onClick={onToggle}
        className="mx-auto flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors group"
      >
        <svg
          className={`w-4 h-4 transition-transform ${open ? "rotate-90" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        {t("guideToggle")}
      </button>

      {open && (
        <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="space-y-6">
            {steps.map((step) => (
              <div key={step.number} className="flex gap-4">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[hsl(var(--preply-pink))]/10 text-[hsl(var(--preply-pink))] flex items-center justify-center text-sm font-bold font-[family-name:var(--font-dm-sans)]">
                  {step.number}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm font-[family-name:var(--font-dm-sans)]">{step.title}</p>
                  <p className="text-sm text-gray-500 mt-1">{step.description}</p>
                  <div className="mt-3 rounded-lg border border-gray-100 overflow-hidden bg-gray-50">
                    <img
                      src={step.image}
                      alt={step.title}
                      className="w-full h-auto"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        target.parentElement!.innerHTML =
                          '<div class="py-8 text-center text-xs text-gray-300">Screenshot placeholder</div>';
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-xs text-gray-400 text-center">{t("guideTip")}</p>
        </div>
      )}
    </div>
  );
}
