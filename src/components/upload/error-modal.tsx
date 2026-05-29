"use client";

import { useEffect } from "react";
import { AlertCircle, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/context/locale-context";

interface ErrorModalProps {
  message: string;
  onClose: () => void;
  onShowGuide: () => void;
}

export function ErrorModal({ message, onClose, onShowGuide }: ErrorModalProps) {
  const { t } = useLocale();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-gray-950/40 backdrop-blur-sm animate-in fade-in-0"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-xl animate-in fade-in-0 zoom-in-95">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 text-gray-400 transition-colors hover:text-gray-600"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[hsl(var(--preply-pink))]/10 text-[hsl(var(--preply-pink))]">
          <AlertCircle className="h-6 w-6" aria-hidden="true" />
        </div>

        <h2 className="mt-4 text-lg font-bold font-[family-name:var(--font-dm-sans)]">
          {t("errorTitle")}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">{message}</p>
        <p className="mt-3 text-sm leading-relaxed text-gray-400">{t("errorHelpIntro")}</p>

        <button
          onClick={() => { onClose(); onShowGuide(); }}
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[hsl(var(--preply-pink))] transition-colors hover:text-[hsl(var(--preply-pink-dark))]"
        >
          {t("errorGuideLink")}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="mt-6 flex justify-end">
          <Button autoFocus onClick={onClose}>{t("errorDismiss")}</Button>
        </div>
      </div>
    </div>
  );
}
