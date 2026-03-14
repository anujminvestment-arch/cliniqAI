"use client";

import { useState } from "react";
import {
  IndianRupee,
  Clock,
  AlertTriangle,
  Plus,
  MoreHorizontal,
  Eye,
  Download,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { StatCard } from "@/components/shared/stat-card";
import { invoicesList } from "@/lib/mock-data";

const statusColors: Record<string, string> = {
  paid: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  overdue: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

function formatStatus(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function BillingPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formPatient, setFormPatient] = useState("");
  const [formItems, setFormItems] = useState("");
  const [formAmount, setFormAmount] = useState("");

  const totalRevenue = invoicesList
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + i.amount, 0);
  const pendingPayments = invoicesList
    .filter((i) => i.status === "pending")
    .reduce((sum, i) => sum + i.amount, 0);
  const overdueAmount = invoicesList
    .filter((i) => i.status === "overdue")
    .reduce((sum, i) => sum + i.amount, 0);

  function handleCreate() {
    setDialogOpen(false);
    setFormPatient("");
    setFormItems("");
    setFormAmount("");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight section-header">Billing</h1>
          <p className="text-muted-foreground">Invoices, payments, and revenue tracking</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button className="cursor-pointer w-fit">
                <Plus className="h-4 w-4 mr-1.5" />
                Create Invoice
              </Button>
            }
          />
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Invoice</DialogTitle>
              <DialogDescription>Generate a new invoice for a patient.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="inv-patient">Patient Name</Label>
                <Input
                  id="inv-patient"
                  placeholder="Enter patient name"
                  value={formPatient}
                  onChange={(e) => setFormPatient(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="inv-items">Items / Description</Label>
                <Input
                  id="inv-items"
                  placeholder="e.g. Consultation + X-Ray"
                  value={formItems}
                  onChange={(e) => setFormItems(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="inv-amount">Amount (₹)</Label>
                <Input
                  id="inv-amount"
                  type="number"
                  placeholder="0"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" className="cursor-pointer" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button className="cursor-pointer" onClick={handleCreate}>
                Create Invoice
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Revenue"
          value={`₹${totalRevenue.toLocaleString("en-IN")}`}
          icon={IndianRupee}
          trend={{ value: 14, positive: true }}
        />
        <StatCard
          title="Pending Payments"
          value={`₹${pendingPayments.toLocaleString("en-IN")}`}
          icon={Clock}
          description="Awaiting payment"
        />
        <StatCard
          title="Overdue"
          value={`₹${overdueAmount.toLocaleString("en-IN")}`}
          icon={AlertTriangle}
          description="Requires follow-up"
        />
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="text-base">Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <Table className="table-enhanced">
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="w-[60px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoicesList.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium font-mono text-xs">{invoice.id}</TableCell>
                  <TableCell>{invoice.patient}</TableCell>
                  <TableCell>{invoice.date}</TableCell>
                  <TableCell className="font-medium">
                    ₹{invoice.amount.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={statusColors[invoice.status]}>
                      {formatStatus(invoice.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-muted-foreground">
                    {invoice.items}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button variant="ghost" size="icon-sm" className="cursor-pointer" />
                        }
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="cursor-pointer">
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                          <Download className="mr-2 h-4 w-4" />
                          Download PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer" variant="destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
