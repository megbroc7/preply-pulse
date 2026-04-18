"use client";

import { useLocale } from "@/context/locale-context";
import { CSVUploader } from "@/components/upload/csv-uploader";
import { CSVGuide } from "@/components/upload/csv-guide";

export function UploadSection() {
  const { t } = useLocale();

  return (
    <section id="upload" className="relative py-20 px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_hsl(330_85%_96%)_0%,_transparent_50%)]" />
      <div className="relative max-w-xl mx-auto">
        <p className="text-center text-[13px] font-medium tracking-widest uppercase text-[hsl(var(--preply-pink))] mb-3">
          {t("uploadLabel")}
        </p>
        <h2 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-dm-sans)] text-center mb-3">
          {t("uploadTitle")}
        </h2>
        <p className="text-center text-gray-400 text-sm mb-10">
          {t("uploadSubtitle")}
        </p>
        <CSVUploader />
        <CSVGuide />
      </div>
    </section>
  );
}
