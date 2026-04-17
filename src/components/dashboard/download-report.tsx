"use client";

import { useCallback, useState, type RefObject } from "react";
import { Button } from "@/components/ui/button";

interface DownloadReportProps {
  exportRef: RefObject<HTMLDivElement | null>;
  onExportStateChange: (exporting: boolean) => void;
}

export function DownloadReport({ exportRef, onExportStateChange }: DownloadReportProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    onExportStateChange(true);

    await new Promise((r) => setTimeout(r, 500));

    try {
      const { toPng } = await import("html-to-image");
      const el = exportRef.current;
      if (!el) return;

      el.style.position = "absolute";
      el.style.left = "0";
      el.style.top = "0";
      el.style.zIndex = "-1";
      el.style.opacity = "1";

      await new Promise((r) => setTimeout(r, 300));

      const dataUrl = await toPng(el, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        width: 1200,
      });

      el.style.position = "";
      el.style.left = "";
      el.style.top = "";
      el.style.zIndex = "";
      el.style.opacity = "";

      const link = document.createElement("a");
      link.download = `preplypulse-report-${new Date().toISOString().split("T")[0]}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error("Export failed:", e);
    } finally {
      setIsExporting(false);
      onExportStateChange(false);
    }
  }, [exportRef, onExportStateChange]);

  return (
    <Button variant="outline" size="sm" onClick={handleExport} disabled={isExporting}>
      {isExporting ? "Exporting..." : "Download Report"}
    </Button>
  );
}
