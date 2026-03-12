"use client";

import {
  CreditCard,
  Download,
  IndianRupee,
  Receipt,
  CalendarDays,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { StatCard } from "@/components/shared/stat-card";
import { patientPortal } from "@/lib/mock-data";

export default function BillingPage() {
  const { invoices } = patientPortal;

  const totalPaid = invoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + inv.amount, 0);

  const paidInvoices = invoices.filter((inv) => inv.status === "paid");
  const lastPayment = paidInvoices.length > 0 ? paidInvoices[0] : null;

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Billing & Payments</h1>
        <p className="text-muted-foreground">
          View your invoices and payment history
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          title="Total Paid"
          value={formatCurrency(totalPaid)}
          icon={IndianRupee}
          description={`${paidInvoices.length} invoices paid`}
        />
        <StatCard
          title="Last Payment"
          value={lastPayment ? formatCurrency(lastPayment.amount) : "N/A"}
          icon={Receipt}
          description={
            lastPayment
              ? new Date(lastPayment.date).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "No payments yet"
          }
        />
      </div>

      {/* Invoice Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CreditCard className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="font-medium">No invoices</p>
              <p className="text-sm text-muted-foreground">
                Your invoices will appear here
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.id}</TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {new Date(invoice.date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </TableCell>
                    <TableCell>{invoice.description}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(invoice.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={invoice.status === "paid" ? "default" : "secondary"}
                        className={
                          invoice.status === "paid"
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-800"
                            : "bg-amber-500/10 text-amber-600 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-800"
                        }
                      >
                        {invoice.status === "paid" ? "Paid" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="cursor-pointer"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
