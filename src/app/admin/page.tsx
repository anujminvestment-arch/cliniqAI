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
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-extrabold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Platform overview and key metrics
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Clinics"
          value={platformStats.totalClinics}
          icon={Building2}
          trend={{ value: 12, positive: true }}
          delay={0}
        />
        <StatCard
          title="Active Patients"
          value={platformStats.activePatients.toLocaleString()}
          icon={Users}
          trend={{ value: 8, positive: true }}
          delay={75}
        />
        <StatCard
          title="Total Appointments"
          value={platformStats.totalAppointments.toLocaleString()}
          icon={CalendarCheck}
          trend={{ value: 5, positive: true }}
          delay={150}
        />
        <StatCard
          title="Monthly Revenue"
          value={formatCurrency(platformStats.monthlyRevenue)}
          icon={IndianRupee}
          trend={{ value: 14, positive: true }}
          delay={225}
        />
        <StatCard
          title="AI Calls Handled"
          value={platformStats.aiCallsHandled.toLocaleString()}
          icon={Phone}
          trend={{ value: 18, positive: true }}
          delay={300}
        />
        <StatCard
          title="Avg Call Duration"
          value={platformStats.avgCallDuration}
          icon={Clock}
          description="Average across all AI calls"
          delay={375}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0891B2" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0891B2" stopOpacity={0} />
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
                    stroke="#0891B2"
                    strokeWidth={2}
                    fill="url(#revenueGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Clinic Growth</CardTitle>
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
                    fill="#059669"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Recent Clinics</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
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
        </CardContent>
      </Card>
    </div>
  );
}
