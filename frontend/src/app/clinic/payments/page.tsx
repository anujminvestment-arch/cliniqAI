"use client";

import { useState, useEffect } from "react";
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
import { Spinner } from "@/components/shared/spinner";
import { billing } from "@/lib/api";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";

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

interface Payment {
  id: string;
  invoice_number: string;
  patient_name: string;
  amount: number;
  method: string;
  status: string;
  paid_at: string | null;
  created_at: string;
}

export default function PaymentsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    billing
      .listPayments()
      .then((data) => setPayments(data.payments ?? []))
      .catch(() => setPayments([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = payments.filter((txn) => {
    const matchesSearch =
      txn.patient_name.toLowerCase().includes(search.toLowerCase()) ||
      txn.invoice_number.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || txn.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const completedTotal = payments
    .filter((t) => t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);
  const pendingCount = payments.filter((t) => t.status === "pending").length;
  const onlineRate =
    payments.length > 0
      ? Math.round(
          (payments.filter((t) => t.method === "UPI" || t.method === "Wallet").length /
            payments.length) *
            100
        )
      : 0;

  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) +
      ", " +
      d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/clinic">Dashboard</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>Payments</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div>
        <h1 className="text-2xl font-bold tracking-tight section-header">Payments</h1>
        <p className="text-muted-foreground">Online payment transactions and collections</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Collections"
          value={formatCurrency(completedTotal)}
          icon={IndianRupee}
          color="primary"
        />
        <StatCard
          title="Pending Payments"
          value={pendingCount}
          icon={Clock}
          color="amber"
          description="Awaiting confirmation"
        />
        <StatCard
          title="Total Transactions"
          value={payments.length}
          icon={TrendingUp}
          color="emerald"
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
                  placeholder="Search patient or invoice..."
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
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto scrollbar-thin">
            <Table className="table-enhanced">
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
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
                  const MethodIcon = methodIcons[txn.method] ?? CreditCard;
                  return (
                    <TableRow key={txn.id}>
                      <TableCell className="font-mono text-xs font-medium">{txn.invoice_number}</TableCell>
                      <TableCell className="font-medium">{txn.patient_name}</TableCell>
                      <TableCell className="font-semibold">{formatCurrency(txn.amount)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={methodColors[txn.method] ?? ""}>
                          <MethodIcon className="h-3 w-3 mr-1" />
                          {txn.method}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={statusColors[txn.status] ?? ""}>
                          {txn.status === "completed" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                          {txn.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                          {txn.status === "failed" && <XCircle className="h-3 w-3 mr-1" />}
                          {txn.status === "refunded" && <RotateCcw className="h-3 w-3 mr-1" />}
                          {txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDateTime(txn.paid_at || txn.created_at)}
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
