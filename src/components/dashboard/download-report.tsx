"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";

export function DownloadReport() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      const { toPng } = await import("html-to-image");
      const dashboardEl = document.getElementById("dashboard-content");
      if (!dashboardEl) return;

      const dataUrl = await toPng(dashboardEl, {
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
    }
  }, []);

  return (
    <Button variant="outline" size="sm" onClick={handleExport} disabled={isExporting}>
      {isExporting ? "Exporting..." : "Download Report"}
    </Button>
  );
}
