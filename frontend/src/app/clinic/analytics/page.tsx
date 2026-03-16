"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  Clock,
  UserX,
  IndianRupee,
  Star,
  BarChart3,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { analytics } from "@/lib/api";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

interface DashboardStats {
  nps?: number;
  avg_wait_time?: string;
  no_show_rate?: string;
  revenue_this_month?: number;
  top_services?: { name: string; count: number; revenue: number }[];
  platform_comparison?: { metric: string; yours: string; platform: string; better: boolean }[];
}

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  appointments_this_month: number;
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<DashboardStats>({});
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analytics.dashboard().catch(() => ({})),
      analytics.doctorPerformance().catch(() => ({ doctors: [] })),
    ])
      .then(([dashData, docData]: [any, any]) => {
        setStats(dashData);
        setDoctors(docData.doctors ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  const topServices: { name: string; count: number; revenue: number }[] =
    stats.top_services ?? [];
  const platformComparison: { metric: string; yours: string; platform: string; better: boolean }[] =
    stats.platform_comparison ?? [];

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
          <BreadcrumbItem><BreadcrumbPage>Analytics</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div>
        <h1 className="text-2xl font-bold tracking-tight section-header">Analytics</h1>
        <p className="text-muted-foreground">Clinic performance insights and benchmarking</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Patient Satisfaction (NPS)"
          value={stats.nps ?? "—"}
          icon={Star}
          color="amber"
        />
        <StatCard
          title="Avg Wait Time"
          value={stats.avg_wait_time ?? "—"}
          icon={Clock}
          color="rose"
        />
        <StatCard
          title="No-Show Rate"
          value={stats.no_show_rate ?? "—"}
          icon={UserX}
          color="violet"
        />
        <StatCard
          title="Revenue This Month"
          value={stats.revenue_this_month != null ? formatCurrency(stats.revenue_this_month) : "—"}
          icon={IndianRupee}
          color="emerald"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Revenue Trend
            </CardTitle>
            <CardDescription>Monthly revenue overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-[200px] items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 bg-muted/30">
              <div className="text-center text-muted-foreground">
                <BarChart3 className="h-10 w-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-medium">Chart: Monthly revenue trend</p>
                <p className="text-xs">Jan — Mar 2026</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-accent" />
              Appointment Volume
            </CardTitle>
            <CardDescription>Daily appointment count</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-[200px] items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 bg-muted/30">
              <div className="text-center text-muted-foreground">
                <BarChart3 className="h-10 w-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-medium">Chart: Daily appointment count</p>
                <p className="text-xs">Last 30 days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base">Doctor Performance</CardTitle>
            <CardDescription>Appointments this month by doctor</CardDescription>
          </CardHeader>
          <CardContent>
            <Table className="table-enhanced">
              <TableHeader>
                <TableRow>
                  <TableHead>Doctor Name</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead>Appts This Month</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {doctors.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.name}</TableCell>
                    <TableCell className="text-muted-foreground">{doc.specialization}</TableCell>
                    <TableCell>{doc.appointments_this_month}</TableCell>
                  </TableRow>
                ))}
                {doctors.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                      No doctor data available.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base">Top Services</CardTitle>
            <CardDescription>Most booked services this month</CardDescription>
          </CardHeader>
          <CardContent>
            <Table className="table-enhanced">
              <TableHeader>
                <TableRow>
                  <TableHead>Service Name</TableHead>
                  <TableHead>Count</TableHead>
                  <TableHead>Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topServices.map((service) => (
                  <TableRow key={service.name}>
                    <TableCell className="font-medium">{service.name}</TableCell>
                    <TableCell>{service.count}</TableCell>
                    <TableCell className="font-semibold">{formatCurrency(service.revenue)}</TableCell>
                  </TableRow>
                ))}
                {topServices.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                      No service data available.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {platformComparison.length > 0 && (
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base">Performance vs Platform Average</CardTitle>
            <CardDescription>How your clinic compares to other clinics on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto scrollbar-thin">
              <Table className="table-enhanced">
                <TableHeader>
                  <TableRow>
                    <TableHead>Metric</TableHead>
                    <TableHead>Your Clinic</TableHead>
                    <TableHead>Platform Avg</TableHead>
                    <TableHead>Comparison</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {platformComparison.map((row) => (
                    <TableRow key={row.metric}>
                      <TableCell className="font-medium">{row.metric}</TableCell>
                      <TableCell className="font-semibold">{row.yours}</TableCell>
                      <TableCell className="text-muted-foreground">{row.platform}</TableCell>
                      <TableCell>
                        {row.better ? (
                          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Better
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                            Below Avg
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
