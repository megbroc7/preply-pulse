"use client";

import { useMemo, useState } from "react";
import type { StudentSummary } from "@/lib/types";
import { formatCurrency, formatNumber } from "@/lib/format";
import { HealthBadge } from "./health-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";

type SortKey =
  | "student"
  | "paidLessons"
  | "earningsUSD"
  | "avgPaidPriceUSD"
  | "lastPaidPriceUSD"
  | "daysSinceLast";

type SortDir = "asc" | "desc";

interface StudentTableProps {
  students: StudentSummary[];
  showHealthScore: boolean;
}

export function StudentTable({ students, showHealthScore }: StudentTableProps) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("earningsUSD");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "student" ? "asc" : "desc");
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return q
      ? students.filter(
          (s) =>
            s.student.toLowerCase().includes(q) ||
            s.studentLocation.toLowerCase().includes(q)
        )
      : students;
  }, [students, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "student") {
        cmp = a.student.localeCompare(b.student);
      } else {
        cmp = a[sortKey] - b[sortKey];
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  function indicator(key: SortKey) {
    if (sortKey !== key) return null;
    return sortDir === "asc" ? " ↑" : " ↓";
  }

  const headerClass =
    "cursor-pointer select-none whitespace-nowrap hover:text-foreground";

  return (
    <div className="space-y-3">
      <Input
        placeholder="Search by student or location…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-xs"
      />

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className={headerClass}
                onClick={() => handleSort("student")}
              >
                Student{indicator("student")}
              </TableHead>
              <TableHead className="whitespace-nowrap">Location</TableHead>
              <TableHead
                className={`${headerClass} text-right`}
                onClick={() => handleSort("paidLessons")}
              >
                Paid Lessons{indicator("paidLessons")}
              </TableHead>
              <TableHead
                className={`${headerClass} text-right`}
                onClick={() => handleSort("earningsUSD")}
              >
                Earnings{indicator("earningsUSD")}
              </TableHead>
              <TableHead
                className={`${headerClass} text-right`}
                onClick={() => handleSort("avgPaidPriceUSD")}
              >
                Avg Price{indicator("avgPaidPriceUSD")}
              </TableHead>
              <TableHead
                className={`${headerClass} text-right`}
                onClick={() => handleSort("lastPaidPriceUSD")}
              >
                Last Price{indicator("lastPaidPriceUSD")}
              </TableHead>
              <TableHead
                className={`${headerClass} text-right`}
                onClick={() => handleSort("daysSinceLast")}
              >
                Days Since Last{indicator("daysSinceLast")}
              </TableHead>
              {showHealthScore && (
                <TableHead className="whitespace-nowrap">Health</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((s) => (
              <TableRow key={s.student}>
                <TableCell className="font-medium">{s.student}</TableCell>
                <TableCell className="text-muted-foreground">
                  {s.studentLocation}
                </TableCell>
                <TableCell className="text-right">
                  {formatNumber(s.paidLessons)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(s.earningsUSD)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(s.avgPaidPriceUSD)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(s.lastPaidPriceUSD)}
                </TableCell>
                <TableCell className="text-right">{s.daysSinceLast}</TableCell>
                {showHealthScore && (
                  <TableCell>
                    <HealthBadge label={s.healthScore.label} />
                  </TableCell>
                )}
              </TableRow>
            ))}
            {sorted.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={showHealthScore ? 8 : 7}
                  className="text-center text-muted-foreground py-8"
                >
                  No students match your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-sm text-muted-foreground">
        Showing {sorted.length} of {students.length} students
      </p>
    </div>
  );
}
