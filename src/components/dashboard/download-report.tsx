"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";

export function DownloadReport() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const dashboardEl = document.getElementById("dashboard-content");
      if (!dashboardEl) return;
      const canvas = await html2canvas(dashboardEl, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      const link = document.createElement("a");
      link.download = `preplypulse-report-${new Date().toISOString().split("T")[0]}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch { /* silently fail */ } finally {
      setIsExporting(false);
    }
  }, []);

  return (
    <Button variant="outline" size="sm" onClick={handleExport} disabled={isExporting}>
      {isExporting ? "Exporting..." : "Download Report"}
    </Button>
  );
}
