"use client";

import { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  Building2,
  IndianRupee,
  Bot,
  Download,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { Spinner } from "@/components/shared/spinner";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { admin, analytics } from "@/lib/api";

const revenueConfig = {
  smileCare: { label: "SmileCare", color: "var(--chart-1)" },
  healthFirst: { label: "HealthFirst", color: "var(--chart-2)" },
  pediaCare: { label: "PediaCare", color: "var(--chart-3)" },
  dermGlow: { label: "DermGlow", color: "var(--chart-4)" },
  brightEyes: { label: "BrightEyes", color: "var(--chart-5)" },
};

const userConfig = {
  patients: { label: "Patients", color: "var(--chart-1)" },
  doctors: { label: "Doctors", color: "var(--chart-2)" },
  staff: { label: "Staff", color: "var(--chart-3)" },
};

const aiConfig = {
  calls: { label: "Total Calls", color: "var(--chart-1)" },
  booked: { label: "Booked", color: "var(--chart-2)" },
};

export default function AdminReportsPage() {
  const [stats, setStats] = useState<any>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsData, dashboard] = await Promise.all([
          admin.stats(),
          analytics.dashboard(),
        ]);
        setStats(statsData);
        setDashboardData(dashboard);
      } catch (err) {
        console.error("Failed to load reports:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  const adminRevenueByClinic = dashboardData?.revenueByClinic || [];
  const userAcquisition = dashboardData?.userAcquisition || [];
  const aiCallAnalytics = dashboardData?.aiCallAnalytics || [];
  const topClinics = dashboardData?.topClinics || [];

  const totalRevenue = adminRevenueByClinic.reduce(
    (sum: number, m: any) => sum + (m.smileCare || 0) + (m.healthFirst || 0) + (m.brightEyes || 0) + (m.dermGlow || 0) + (m.pediaCare || 0),
    0
  );
  const totalAiCalls = aiCallAnalytics.reduce((sum: number, d: any) => sum + (d.calls || 0), 0);
  const totalBooked = aiCallAnalytics.reduce((sum: number, d: any) => sum + (d.booked || 0), 0);
  const successRate = totalAiCalls > 0 ? Math.round((totalBooked / totalAiCalls) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight section-header">Platform Reports</h1>
          <p className="text-muted-foreground">Cross-clinic analytics and performance metrics</p>
        </div>
        <Button variant="outline" className="cursor-pointer w-fit">
          <Download className="h-4 w-4 mr-1.5" />
          Export Report
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Platform Revenue"
          value={`₹${(totalRevenue / 10000000).toFixed(1)}Cr`}
          icon={IndianRupee}
          color="primary"
          trend={{ value: 15, positive: true }}
        />
        <StatCard title="Active Clinics" value={stats?.totalClinics ?? 0} icon={Building2} color="accent" />
        <StatCard title="Total Patients" value={(stats?.activePatients ?? 0).toLocaleString()} icon={Users} color="emerald" />
        <StatCard
          title="AI Success Rate"
          value={`${successRate}%`}
          icon={Bot}
          color="violet"
          description={`${totalBooked} booked / ${totalAiCalls} calls`}
        />
      </div>

      {/* Revenue by Clinic */}
      <Card className="animate-fade-in-up">
        <CardHeader>
          <CardTitle className="text-base section-header">Revenue by Clinic</CardTitle>
          <CardDescription>Monthly revenue breakdown across all clinics</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={revenueConfig} className="h-[320px] w-full">
            <BarChart data={adminRevenueByClinic}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" tickFormatter={(v) => `₹${v / 1000}K`} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey="smileCare" stackId="a" fill="var(--chart-1)" radius={[0, 0, 0, 0]} />
              <Bar dataKey="healthFirst" stackId="a" fill="var(--chart-2)" />
              <Bar dataKey="pediaCare" stackId="a" fill="var(--chart-3)" />
              <Bar dataKey="dermGlow" stackId="a" fill="var(--chart-4)" />
              <Bar dataKey="brightEyes" stackId="a" fill="var(--chart-5)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* User Acquisition */}
        <Card className="animate-fade-in-up delay-100">
          <CardHeader>
            <CardTitle className="text-base section-header">User Acquisition</CardTitle>
            <CardDescription>New users by role per month</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={userConfig} className="h-[250px] w-full">
              <AreaChart data={userAcquisition}>
                <defs>
                  <linearGradient id="patientsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="patients" stroke="var(--chart-1)" fill="url(#patientsGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="doctors" stroke="var(--chart-2)" fill="transparent" strokeWidth={2} />
                <Area type="monotone" dataKey="staff" stroke="var(--chart-3)" fill="transparent" strokeWidth={2} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* AI Call Analytics */}
        <Card className="animate-fade-in-up delay-200">
          <CardHeader>
            <CardTitle className="text-base section-header">AI Call Volume & Success</CardTitle>
            <CardDescription>Last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={aiConfig} className="h-[250px] w-full">
              <BarChart data={aiCallAnalytics}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="calls" fill="var(--chart-1)" radius={[4, 4, 0, 0]} opacity={0.3} />
                <Bar dataKey="booked" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Clinics */}
      <Card className="animate-fade-in-up delay-300 overflow-hidden">
        <CardHeader>
          <CardTitle className="text-base section-header">Top Performing Clinics</CardTitle>
          <CardDescription>Ranked by total revenue</CardDescription>
        </CardHeader>
        <CardContent>
          <Table className="table-enhanced">
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Clinic</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Patients</TableHead>
                <TableHead>Doctors</TableHead>
                <TableHead>Growth</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topClinics.map((clinic: any, i: number) => (
                <TableRow key={clinic.name}>
                  <TableCell>
                    <Badge variant={i < 3 ? "default" : "secondary"} className={
                      i === 0 ? "bg-amber-500" : i === 1 ? "bg-gray-400" : i === 2 ? "bg-amber-700" : ""
                    }>
                      #{i + 1}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{clinic.name}</TableCell>
                  <TableCell>₹{((clinic.revenue || 0) / 100000).toFixed(1)}L</TableCell>
                  <TableCell>{(clinic.patients || 0).toLocaleString()}</TableCell>
                  <TableCell>{clinic.doctors}</TableCell>
                  <TableCell>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                      <TrendingUp className="h-3.5 w-3.5" />
                      +{clinic.growth}%
                    </span>
                  </TableCell>
                </TableRow>
              ))}
              {topClinics.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
