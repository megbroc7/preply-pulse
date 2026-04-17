"use client";

import type { PricingOpportunity } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PricingTableProps {
  opportunities: PricingOpportunity[];
}

export function PricingTable({ opportunities }: PricingTableProps) {
  if (opportunities.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No pricing opportunities</p>
      </Card>
    );
  }

  const totalUplift10 = opportunities.reduce((sum, o) => sum + o.monthlyUplift10, 0);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        These long-term students are strong candidates for a rate increase. Raising by $10/lesson
        across this list would add{" "}
        <span className="font-semibold text-foreground">{formatCurrency(totalUplift10)}</span> to
        your monthly earnings.
      </p>
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right whitespace-nowrap">Total Lessons</TableHead>
              <TableHead className="text-right whitespace-nowrap">Current Rate</TableHead>
              <TableHead className="text-right whitespace-nowrap">Lessons (90d)</TableHead>
              <TableHead className="text-right whitespace-nowrap">+$5/mo</TableHead>
              <TableHead className="text-right whitespace-nowrap">+$10/mo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {opportunities.map((o) => (
              <TableRow key={o.student}>
                <TableCell className="font-medium">{o.student}</TableCell>
                <TableCell className="text-muted-foreground">{o.studentLocation}</TableCell>
                <TableCell className="text-right">{o.paidLessons}</TableCell>
                <TableCell className="text-right">{formatCurrency(o.lastPaidPriceUSD)}</TableCell>
                <TableCell className="text-right">{o.lessons90d}</TableCell>
                <TableCell className="text-right">{formatCurrency(o.monthlyUplift5)}</TableCell>
                <TableCell className="text-right">{formatCurrency(o.monthlyUplift10)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
