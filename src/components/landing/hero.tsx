"use client";

import { useLocale } from "@/context/locale-context";

export function Hero() {
  const { t } = useLocale();

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(330_85%_96%)_0%,_transparent_50%)]" />

      <div className="relative pt-12 pb-24 px-4 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-sm border border-pink-100 px-4 py-2 text-[13px] tracking-wide text-gray-500 mb-12 shadow-sm">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {t("trustBadgePrivacy")}
          </span>
          <span className="text-pink-200">&#8226;</span>
          <span>{t("trustBadgeFree")}</span>
          <span className="text-pink-200">&#8226;</span>
          <span>{t("trustBadgeNoSignup")}</span>
        </div>

        <h1 className="text-[2.75rem] md:text-6xl font-bold font-[family-name:var(--font-dm-sans)] leading-[1.1] tracking-tight">
          {t("heroLine1")}
          <br />
          <span className="relative inline-block mt-2">
            <span className="relative z-10">{t("heroLine2")}</span>
            <span className="absolute bottom-1 left-0 right-0 h-3 bg-[hsl(var(--preply-pink))]/20 -rotate-[0.5deg] rounded-sm" />
          </span>
        </h1>

        <p className="mt-8 text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
          {t("heroBody")}
          <span className="text-gray-900 font-medium"> {t("heroTermRetention")}</span>,
          <span className="text-gray-900 font-medium"> {t("heroTermPricing")}</span>,
          <span className="text-gray-900 font-medium"> {t("heroTermQuality")}</span>
          {t("heroBodyEnd")}
        </p>

        <p className="mt-3 text-base text-gray-400">
          {t("heroTagline")}
        </p>

        <p className="mt-4 flex items-center justify-center gap-1.5 text-sm text-emerald-600">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          {t("heroPrivacy")}
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#upload"
            className="group relative inline-flex items-center gap-2 bg-[hsl(var(--preply-pink))] hover:bg-[hsl(var(--preply-pink-dark))] text-white font-semibold px-8 py-3.5 rounded-full transition-all text-base shadow-lg shadow-pink-200/50 hover:shadow-xl hover:shadow-pink-300/50 hover:-translate-y-0.5"
          >
            {t("heroCTA")}
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
          <a
            href="#demo"
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors underline underline-offset-4 decoration-gray-200 hover:decoration-gray-400"
          >
            {t("heroDemo")}
          </a>
        </div>

        <div className="mt-16 inline-flex items-center gap-3 rounded-full bg-white/80 backdrop-blur-sm border border-gray-100 pl-1.5 pr-5 py-1.5 shadow-sm">
          <img
            src="https://avatars.preply.com/i/logos/i/logos/avatar_chr62d0iny.jpg"
            alt="Megan B."
            className="w-8 h-8 rounded-full object-cover ring-2 ring-white"
          />
          <span className="text-[13px] text-gray-500">
            {t("heroMadeBy")} <span className="font-medium text-gray-700">Megan B.</span>{t("heroMadeByEnd")}
          </span>
        </div>
      </div>
    </section>
  );
}
