"use client";

import { useState } from "react";
import {
  IndianRupee,
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Eye,
  Bell,
  CreditCard,
  Smartphone,
  Wallet,
  Globe,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { StatCard } from "@/components/shared/stat-card";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const statusColors: Record<string, string> = {
  completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  failed: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  refunded: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
};

const methodColors: Record<string, string> = {
  UPI: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  Card: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Wallet: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  "Net Banking": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
};

const methodIcons: Record<string, React.ElementType> = {
  UPI: Smartphone,
  Card: CreditCard,
  Wallet: Wallet,
  "Net Banking": Globe,
};

const transactions = [
  { id: "TXN-4501", patient: "Priya Sharma", amount: 1500, method: "UPI", status: "completed", date: "13 Mar 2026", time: "10:15 AM" },
  { id: "TXN-4502", patient: "Rahul Mehta", amount: 3200, method: "Card", status: "completed", date: "13 Mar 2026", time: "10:45 AM" },
  { id: "TXN-4503", patient: "Anjali Desai", amount: 800, method: "Wallet", status: "pending", date: "13 Mar 2026", time: "11:00 AM" },
  { id: "TXN-4504", patient: "Vikram Singh", amount: 2500, method: "Net Banking", status: "completed", date: "13 Mar 2026", time: "11:30 AM" },
  { id: "TXN-4505", patient: "Neha Gupta", amount: 1800, method: "UPI", status: "failed", date: "13 Mar 2026", time: "12:00 PM" },
  { id: "TXN-4506", patient: "Arjun Patel", amount: 4500, method: "Card", status: "completed", date: "12 Mar 2026", time: "09:30 AM" },
  { id: "TXN-4507", patient: "Kavita Reddy", amount: 1200, method: "UPI", status: "refunded", date: "12 Mar 2026", time: "02:15 PM" },
  { id: "TXN-4508", patient: "Suresh Kumar", amount: 2000, method: "Wallet", status: "pending", date: "12 Mar 2026", time: "03:00 PM" },
  { id: "TXN-4509", patient: "Meera Joshi", amount: 3500, method: "Card", status: "completed", date: "12 Mar 2026", time: "04:20 PM" },
  { id: "TXN-4510", patient: "Deepak Rao", amount: 900, method: "UPI", status: "completed", date: "11 Mar 2026", time: "10:00 AM" },
];

export default function PaymentsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState("today");

  const filtered = transactions.filter((txn) => {
    const matchesSearch =
      txn.patient.toLowerCase().includes(search.toLowerCase()) ||
      txn.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || txn.status === statusFilter;
    const matchesDate =
      dateRange === "month" ||
      (dateRange === "week" && (txn.date.includes("13 Mar") || txn.date.includes("12 Mar") || txn.date.includes("11 Mar"))) ||
      (dateRange === "today" && txn.date.includes("13 Mar"));
    return matchesSearch && matchesStatus && matchesDate;
  });

  const todayCompleted = transactions
    .filter((t) => t.date.includes("13 Mar") && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);
  const pendingCount = transactions.filter((t) => t.status === "pending").length;
  const monthTotal = transactions
    .filter((t) => t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);
  const onlineRate = Math.round(
    (transactions.filter((t) => t.method === "UPI" || t.method === "Wallet").length /
      transactions.length) *
      100
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight section-header">Payments</h1>
        <p className="text-muted-foreground">Online payment transactions and collections</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Today's Collections"
          value={formatCurrency(todayCompleted)}
          icon={IndianRupee}
          color="primary"
          trend={{ value: 14, positive: true }}
        />
        <StatCard
          title="Pending Payments"
          value={pendingCount}
          icon={Clock}
          color="amber"
          description="Awaiting confirmation"
        />
        <StatCard
          title="Total This Month"
          value={formatCurrency(monthTotal)}
          icon={TrendingUp}
          color="emerald"
          trend={{ value: 22, positive: true }}
        />
        <StatCard
          title="Online Payment Rate"
          value={`${onlineRate}%`}
          icon={Smartphone}
          color="violet"
          description="UPI + Wallet payments"
        />
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base">All Transactions</CardTitle>
            <div className="flex flex-wrap gap-2">
              <div className="relative max-w-xs">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search patient or TXN ID..."
                  className="pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateRange} onValueChange={(v) => setDateRange(v ?? "today")}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto scrollbar-thin">
            <Table className="table-enhanced">
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Patient Name</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((txn) => {
                  const MethodIcon = methodIcons[txn.method];
                  return (
                    <TableRow key={txn.id}>
                      <TableCell className="font-mono text-xs font-medium">{txn.id}</TableCell>
                      <TableCell className="font-medium">{txn.patient}</TableCell>
                      <TableCell className="font-semibold">{formatCurrency(txn.amount)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={methodColors[txn.method]}>
                          <MethodIcon className="h-3 w-3 mr-1" />
                          {txn.method}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={statusColors[txn.status]}>
                          {txn.status === "completed" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                          {txn.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                          {txn.status === "failed" && <XCircle className="h-3 w-3 mr-1" />}
                          {txn.status === "refunded" && <RotateCcw className="h-3 w-3 mr-1" />}
                          {txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {txn.date}, {txn.time}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon-sm" className="cursor-pointer">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {txn.status === "pending" && (
                            <Button variant="ghost" size="icon-sm" className="cursor-pointer text-amber-600">
                              <Bell className="h-4 w-4" />
                            </Button>
                          )}
                          {txn.status === "completed" && (
                            <Button variant="ghost" size="icon-sm" className="cursor-pointer text-blue-600">
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      No transactions found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
