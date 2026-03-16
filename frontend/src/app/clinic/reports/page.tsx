"use client";

import { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  IndianRupee,
  CalendarCheck,
  Download,
  Activity,
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
  PieChart,
  Pie,
  Cell,
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
import { analytics as analyticsApi } from "@/lib/api";

const PIE_COLORS = [
  "oklch(0.46 0.20 264)",
  "oklch(0.58 0.155 170)",
  "oklch(0.62 0.15 148)",
  "oklch(0.55 0.17 300)",
  "oklch(0.72 0.14 60)",
  "oklch(0.65 0.20 30)",
  "oklch(0.50 0.10 240)",
];

const revenueConfig = {
  revenue: { label: "Revenue", color: "var(--chart-1)" },
  appointments: { label: "Appointments", color: "var(--chart-2)" },
};

const patientConfig = {
  patients: { label: "New Patients", color: "var(--chart-3)" },
};

export default function ReportsPage() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [trendsData, setTrendsData] = useState<any[]>([]);
  const [doctorPerformance, setDoctorPerformance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsApi.dashboard(),
      analyticsApi.trends(180),
      analyticsApi.doctorPerformance(),
    ])
      .then(([dashboard, trends, docPerf]: [any, any, any]) => {
        setDashboardData(dashboard);
        setTrendsData(trends.monthly_revenue || trends.trends || []);
        setDoctorPerformance(docPerf.doctors || docPerf.doctor_performance || []);
      })
      .catch(() => {
        setDashboardData(null);
        setTrendsData([]);
        setDoctorPerformance([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  const monthlyRevenueData = trendsData;
  const topDiagnoses = dashboardData?.top_diagnoses || [];
  const busiestHours = dashboardData?.busiest_hours || [];

  const latestMonth = monthlyRevenueData.length > 0 ? monthlyRevenueData[monthlyRevenueData.length - 1] : { revenue: 0, appointments: 0, patients: 0 };
  const prevMonth = monthlyRevenueData.length > 1 ? monthlyRevenueData[monthlyRevenueData.length - 2] : { revenue: 1 };
  const revenueGrowth = prevMonth.revenue ? Math.round(((latestMonth.revenue - prevMonth.revenue) / prevMonth.revenue) * 100) : 0;
  const totalRevenue = monthlyRevenueData.reduce((sum: number, m: any) => sum + (m.revenue || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight section-header">Reports</h1>
          <p className="text-muted-foreground">Clinic analytics and performance insights</p>
        </div>
        <Button variant="outline" className="cursor-pointer w-fit">
          <Download className="h-4 w-4 mr-1.5" />
          Export Report
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard title="Total Revenue" value={`₹${(totalRevenue / 100000).toFixed(1)}L`} icon={IndianRupee} color="primary" trend={{ value: revenueGrowth, positive: true }} />
        <StatCard title="This Month" value={`₹${((latestMonth.revenue || 0) / 1000).toFixed(0)}K`} icon={TrendingUp} color="emerald" />
        <StatCard title="Appointments" value={latestMonth.appointments || 0} icon={CalendarCheck} color="accent" />
        <StatCard title="New Patients" value={latestMonth.patients || 0} icon={Users} color="violet" />
      </div>

      {/* Revenue Chart */}
      <Card className="animate-fade-in-up">
        <CardHeader>
          <CardTitle className="text-base">Revenue & Appointments Trend</CardTitle>
          <CardDescription>Last 6 months overview</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={revenueConfig} className="h-[300px] w-full">
            <AreaChart data={monthlyRevenueData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" tickFormatter={(v) => `₹${v / 1000}K`} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area type="monotone" dataKey="revenue" stroke="var(--chart-1)" fill="url(#revGrad)" strokeWidth={2} />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Top Diagnoses */}
        <Card className="animate-fade-in-up delay-100">
          <CardHeader>
            <CardTitle className="text-base">Top Diagnoses</CardTitle>
            <CardDescription>Distribution of patient diagnoses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topDiagnoses}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={50}
                    paddingAngle={2}
                    label={({ name, percentage }) => `${name} (${percentage}%)`}
                    labelLine={false}
                  >
                    {topDiagnoses.map((_: any, i: number) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Doctor Performance */}
        <Card className="animate-fade-in-up delay-200 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base">Doctor Performance</CardTitle>
            <CardDescription>Monthly comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <Table className="table-enhanced">
              <TableHeader>
                <TableRow>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Appointments</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Completion</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {doctorPerformance.map((doc: any) => (
                  <TableRow key={doc.name}>
                    <TableCell className="font-medium">{doc.name}</TableCell>
                    <TableCell>{doc.appointments}</TableCell>
                    <TableCell>₹{((doc.revenue || 0) / 1000).toFixed(0)}K</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                        {doc.rating}
                      </Badge>
                    </TableCell>
                    <TableCell>{doc.completionRate || doc.completion_rate}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Busiest Hours Heatmap */}
      {busiestHours.length > 0 && (
        <Card className="animate-fade-in-up delay-300">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Busiest Hours Heatmap
            </CardTitle>
            <CardDescription>Appointment density by day and hour</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    <th className="text-left p-2 font-medium text-muted-foreground">Hour</th>
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                      <th key={d} className="text-center p-2 font-medium text-muted-foreground">{d}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {busiestHours.map((row: any) => (
                    <tr key={row.hour}>
                      <td className="p-2 font-medium text-muted-foreground">{row.hour}</td>
                      {[row.mon, row.tue, row.wed, row.thu, row.fri, row.sat].map((val: number, i: number) => {
                        const intensity = Math.min(val / 11, 1);
                        return (
                          <td key={i} className="p-1 text-center">
                            <div
                              className="rounded-md p-2 text-xs font-medium transition-colors"
                              style={{
                                backgroundColor: `oklch(0.46 0.20 264 / ${0.05 + intensity * 0.4})`,
                                color: intensity > 0.5 ? "white" : undefined,
                              }}
                            >
                              {val}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
