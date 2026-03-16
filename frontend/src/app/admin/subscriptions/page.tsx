"use client";

import { useState } from "react";
import {
  CreditCard,
  Search,
  IndianRupee,
  Users,
  TrendingDown,
  Clock,
  MoreHorizontal,
  Eye,
  Pencil,
  Ban,
  RefreshCcw,
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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { StatCard } from "@/components/shared/stat-card";

// ---------------------------------------------------------------------------
// Inline mock data
// ---------------------------------------------------------------------------

interface Subscription {
  id: string;
  clinicName: string;
  plan: "Basic" | "Pro" | "Enterprise";
  status: "Active" | "Trial" | "Expired" | "Cancelled";
  startDate: string;
  nextBilling: string;
  amount: number;
}

const subscriptions: Subscription[] = [
  { id: "SUB-001", clinicName: "SmileCare Dental", plan: "Pro", status: "Active", startDate: "2025-08-15", nextBilling: "2026-04-15", amount: 2499 },
  { id: "SUB-002", clinicName: "HealthFirst Clinic", plan: "Enterprise", status: "Active", startDate: "2025-06-01", nextBilling: "2026-04-01", amount: 4999 },
  { id: "SUB-003", clinicName: "PediaCare Children's Hospital", plan: "Basic", status: "Trial", startDate: "2026-03-01", nextBilling: "2026-03-31", amount: 999 },
  { id: "SUB-004", clinicName: "DermGlow Skin Centre", plan: "Pro", status: "Active", startDate: "2025-11-10", nextBilling: "2026-04-10", amount: 2499 },
  { id: "SUB-005", clinicName: "BrightEyes Vision", plan: "Enterprise", status: "Expired", startDate: "2025-01-20", nextBilling: "—", amount: 4999 },
  { id: "SUB-006", clinicName: "OrthoCure Physiotherapy", plan: "Basic", status: "Active", startDate: "2025-09-05", nextBilling: "2026-04-05", amount: 999 },
  { id: "SUB-007", clinicName: "MindWell Psychology", plan: "Pro", status: "Cancelled", startDate: "2025-07-12", nextBilling: "—", amount: 2499 },
  { id: "SUB-008", clinicName: "NutriLife Wellness", plan: "Basic", status: "Trial", startDate: "2026-02-20", nextBilling: "2026-03-20", amount: 999 },
  { id: "SUB-009", clinicName: "HeartBeat Cardiology", plan: "Enterprise", status: "Active", startDate: "2025-04-18", nextBilling: "2026-04-18", amount: 4999 },
  { id: "SUB-010", clinicName: "ClearPath ENT", plan: "Pro", status: "Active", startDate: "2025-10-22", nextBilling: "2026-04-22", amount: 2499 },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const planColors: Record<string, string> = {
  Basic: "bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400",
  Pro: "bg-primary/10 text-primary",
  Enterprise: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
};

const statusColors: Record<string, string> = {
  Active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Trial: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Expired: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  Cancelled: "bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400",
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function SubscriptionsPage() {
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = subscriptions.filter((sub) => {
    const matchesSearch =
      sub.clinicName.toLowerCase().includes(search.toLowerCase()) ||
      sub.id.toLowerCase().includes(search.toLowerCase());
    const matchesPlan = planFilter === "all" || sub.plan === planFilter;
    const matchesStatus = statusFilter === "all" || sub.status === statusFilter;
    return matchesSearch && matchesPlan && matchesStatus;
  });

  // Stat computations
  const totalSubscribers = subscriptions.length;
  const monthlyRevenue = subscriptions
    .filter((s) => s.status === "Active" || s.status === "Trial")
    .reduce((sum, s) => sum + s.amount, 0);
  const activeTrials = subscriptions.filter((s) => s.status === "Trial").length;
  const churnRate =
    ((subscriptions.filter((s) => s.status === "Cancelled" || s.status === "Expired").length /
      totalSubscribers) *
      100).toFixed(1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight section-header">Subscriptions</h1>
        <p className="text-muted-foreground">
          Manage clinic subscription plans and billing
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Subscribers"
          value={totalSubscribers}
          icon={Users}
          color="primary"
          trend={{ value: 8, positive: true }}
          delay={0}
        />
        <StatCard
          title="Monthly Revenue"
          value={formatCurrency(monthlyRevenue)}
          icon={IndianRupee}
          color="emerald"
          trend={{ value: 12, positive: true }}
          delay={75}
        />
        <StatCard
          title="Active Trials"
          value={activeTrials}
          icon={Clock}
          color="amber"
          description="Trials expiring this month"
          delay={150}
        />
        <StatCard
          title="Churn Rate"
          value={`${churnRate}%`}
          icon={TrendingDown}
          color="rose"
          trend={{ value: 2.1, positive: false }}
          delay={225}
        />
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search clinics..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={planFilter} onValueChange={(v) => setPlanFilter(v ?? "all")}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Plan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Plans</SelectItem>
            <SelectItem value="Basic">Basic</SelectItem>
            <SelectItem value="Pro">Pro</SelectItem>
            <SelectItem value="Enterprise">Enterprise</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Trial">Trial</SelectItem>
            <SelectItem value="Expired">Expired</SelectItem>
            <SelectItem value="Cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Subscriptions Table */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 section-header">
            <CreditCard className="h-4 w-4 text-primary" />
            Clinic Subscriptions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto scrollbar-thin">
            <Table className="table-enhanced">
              <TableHeader>
                <TableRow>
                  <TableHead>Clinic Name</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Next Billing</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-[60px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{sub.clinicName}</p>
                        <p className="text-xs text-muted-foreground">{sub.id}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={planColors[sub.plan]}>
                        {sub.plan}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={statusColors[sub.status]}>
                        {sub.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {sub.startDate}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {sub.nextBilling}
                    </TableCell>
                    <TableCell className="text-right font-medium whitespace-nowrap">
                      {formatCurrency(sub.amount)}/mo
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
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">
                            <Pencil className="mr-2 h-4 w-4" />
                            Change Plan
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {sub.status === "Cancelled" || sub.status === "Expired" ? (
                            <DropdownMenuItem className="cursor-pointer">
                              <RefreshCcw className="mr-2 h-4 w-4" />
                              Reactivate
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem className="cursor-pointer" variant="destructive">
                              <Ban className="mr-2 h-4 w-4" />
                              Cancel Subscription
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      No subscriptions match your filters.
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
