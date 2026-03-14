"use client";

import {
  Building2,
  Users,
  CalendarCheck,
  IndianRupee,
  Phone,
  Clock,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatCard } from "@/components/shared/stat-card";
import { platformStats, revenueData, clinicsList } from "@/lib/mock-data";

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const statusColor: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  suspended: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function AdminDashboard() {
  const recentClinics = clinicsList.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="welcome-banner rounded-xl p-5 animate-fade-in-up">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Welcome back, Admin</h1>
            <p className="text-muted-foreground mt-0.5">
              Here&apos;s what&apos;s happening across your platform today
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse-soft" />
            All systems operational
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Clinics"
          value={platformStats.totalClinics}
          icon={Building2}
          color="primary"
          trend={{ value: 12, positive: true }}
          delay={0}
        />
        <StatCard
          title="Active Patients"
          value={platformStats.activePatients.toLocaleString()}
          icon={Users}
          color="accent"
          trend={{ value: 8, positive: true }}
          delay={75}
        />
        <StatCard
          title="Total Appointments"
          value={platformStats.totalAppointments.toLocaleString()}
          icon={CalendarCheck}
          color="violet"
          trend={{ value: 5, positive: true }}
          delay={150}
        />
        <StatCard
          title="Monthly Revenue"
          value={formatCurrency(platformStats.monthlyRevenue)}
          icon={IndianRupee}
          color="emerald"
          trend={{ value: 14, positive: true }}
          delay={225}
        />
        <StatCard
          title="AI Calls Handled"
          value={platformStats.aiCallsHandled.toLocaleString()}
          icon={Phone}
          color="amber"
          trend={{ value: 18, positive: true }}
          delay={300}
        />
        <StatCard
          title="Avg Call Duration"
          value={platformStats.avgCallDuration}
          icon={Clock}
          color="rose"
          description="Average across all AI calls"
          delay={375}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base font-semibold section-header">Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.46 0.20 264)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="oklch(0.46 0.20 264)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="month"
                    className="text-xs"
                    tick={{ fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    className="text-xs"
                    tick={{ fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      color: "var(--popover-foreground)",
                    }}
                    formatter={(value: number) => [formatCurrency(value), "Revenue"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    fill="url(#revenueGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base font-semibold section-header">Clinic Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="month"
                    className="text-xs"
                    tick={{ fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    className="text-xs"
                    tick={{ fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      color: "var(--popover-foreground)",
                    }}
                    formatter={(value: number) => [value, "Clinics"]}
                  />
                  <Bar
                    dataKey="clinics"
                    fill="var(--accent)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="text-base font-semibold section-header">Recent Clinics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto scrollbar-thin">
          <Table className="table-enhanced">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead className="text-right">Doctors</TableHead>
                <TableHead className="text-right">Patients</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentClinics.map((clinic) => (
                <TableRow key={clinic.id}>
                  <TableCell className="font-medium">{clinic.name}</TableCell>
                  <TableCell>{clinic.city}</TableCell>
                  <TableCell>{clinic.plan}</TableCell>
                  <TableCell className="text-right">{clinic.doctors}</TableCell>
                  <TableCell className="text-right">{clinic.patients.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={statusColor[clinic.status]}
                    >
                      {clinic.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
