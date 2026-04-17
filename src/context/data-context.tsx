"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { track } from "@vercel/analytics/react";
import { parseCSV } from "@/lib/parse-csv";
import { processData } from "@/lib/process-data";
import type { ProcessedData } from "@/lib/types";

interface DataContextType {
  data: ProcessedData | null;
  isDemo: boolean;
  didReset: boolean;
  error: string | null;
  isLoading: boolean;
  loadCSV: (csvString: string) => void;
  loadDemo: () => void;
  reset: () => void;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ProcessedData | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [didReset, setDidReset] = useState(false);

  const loadCSV = useCallback((csvString: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const parseResult = parseCSV(csvString);
      if (!parseResult.success) {
        setError(parseResult.error);
        setIsLoading(false);
        return;
      }
      const processed = processData(parseResult.data);
      setData(processed);
      setIsDemo(false);
      track("csv_uploaded", {
        totalLessons: processed.totalLessons,
        totalStudents: processed.totalStudents,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "An unexpected error occurred while processing your data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadDemo = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { MOCK_DATA } = await import("@/lib/mock-data");
      const processed = processData(MOCK_DATA);
      setData(processed);
      setIsDemo(true);
    } catch {
      setError("Failed to load demo data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setIsDemo(false);
    setError(null);
    setDidReset(true);
  }, []);

  return (
    <DataContext.Provider value={{ data, isDemo, didReset, error, isLoading, loadCSV, loadDemo, reset }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData(): DataContextType {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
