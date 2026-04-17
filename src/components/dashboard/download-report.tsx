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

    // Wait for all tabs to render
    await new Promise((r) => setTimeout(r, 500));

    try {
      const { toPng } = await import("html-to-image");
      const el = exportRef.current;
      if (!el) return;

      const dataUrl = await toPng(el, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });

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
