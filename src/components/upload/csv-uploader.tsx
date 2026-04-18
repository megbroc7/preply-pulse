"use client";

import { useCallback, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useData } from "@/context/data-context";
import { useLocale } from "@/context/locale-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function CSVUploader() {
  const { loadCSV, error, isLoading } = useData();
  const { t } = useLocale();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.name.endsWith(".csv")) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        loadCSV(text);
        router.push("/dashboard");
      };
      reader.readAsText(file);
    },
    [loadCSV, router]
  );

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => { setIsDragOver(false); }, []);
  const handleClick = useCallback(() => { fileInputRef.current?.click(); }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <Card
      className={`border-2 border-dashed p-12 text-center transition-colors cursor-pointer ${
        isDragOver
          ? "border-[hsl(var(--preply-pink))] bg-[hsl(var(--preply-pink-light))]"
          : "border-muted-foreground/25 hover:border-[hsl(var(--preply-pink))]"
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleClick}
    >
      <input ref={fileInputRef} type="file" accept=".csv" onChange={handleInputChange} className="hidden" />
      <div className="flex flex-col items-center gap-4">
        <div className="text-4xl">📊</div>
        <div>
          <p className="text-lg font-medium font-[family-name:var(--font-dm-sans)]">
            {isLoading ? t("uploadProcessing") : t("uploadDrop")}
          </p>
          <p className="text-sm text-muted-foreground mt-2">{t("uploadHint")}</p>
        </div>
        <Button variant="outline" size="lg" disabled={isLoading} onClick={(e) => { e.stopPropagation(); handleClick(); }}>
          {t("uploadButton")}
        </Button>
        {error && <p className="text-sm text-red-600 mt-2 max-w-md">{error}</p>}
        <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          {t("uploadPrivacy")}
        </div>
      </div>
    </Card>
  );
}
