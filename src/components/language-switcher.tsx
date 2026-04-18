"use client";

import { useLocale } from "@/context/locale-context";
import { locales } from "@/lib/i18n";

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();

  return (
    <select
      value={locale}
      onChange={(e) => setLocale(e.target.value as "en" | "es")}
      className="fixed top-5 left-5 z-50 text-sm bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full px-3 py-1.5 text-gray-600 shadow-sm hover:shadow-md transition-shadow cursor-pointer appearance-none"
      style={{ backgroundImage: "none" }}
      aria-label="Select language"
    >
      {locales.map((l) => (
        <option key={l.code} value={l.code}>
          {l.code === "en" ? "🇺🇸" : "🇪🇸"} {l.label}
        </option>
      ))}
    </select>
  );
}
