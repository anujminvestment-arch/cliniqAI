"use client";

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

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const doctorUtilization = [
  { name: "Dr. Priya Patel", appointmentsToday: 12, utilization: 92, rating: 4.8 },
  { name: "Dr. Amit Shah", appointmentsToday: 10, utilization: 85, rating: 4.6 },
  { name: "Dr. Neha Gupta", appointmentsToday: 8, utilization: 78, rating: 4.9 },
  { name: "Dr. Rajesh Kumar", appointmentsToday: 11, utilization: 88, rating: 4.5 },
];

const topServices = [
  { name: "General Consultation", count: 245, revenue: 367500 },
  { name: "Dental Cleaning", count: 128, revenue: 320000 },
  { name: "Root Canal Treatment", count: 42, revenue: 504000 },
  { name: "Orthodontic Checkup", count: 67, revenue: 167500 },
  { name: "Teeth Whitening", count: 35, revenue: 175000 },
];

const platformComparison = [
  { metric: "Avg Wait Time", yours: "18 min", platform: "24 min", better: true },
  { metric: "No-Show Rate", yours: "5.2%", platform: "8.7%", better: true },
  { metric: "Patient Rating", yours: "4.7/5", platform: "4.3/5", better: true },
  { metric: "Revenue / Doctor", yours: formatCurrency(185000), platform: formatCurrency(142000), better: true },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Clinic performance insights and benchmarking</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Patient Satisfaction (NPS)"
          value="72"
          icon={Star}
          color="amber"
          trend={{ value: 5, positive: true }}
        />
        <StatCard
          title="Avg Wait Time"
          value="18 min"
          icon={Clock}
          color="rose"
          trend={{ value: 8, positive: false }}
        />
        <StatCard
          title="No-Show Rate"
          value="5.2%"
          icon={UserX}
          color="violet"
          trend={{ value: 12, positive: false }}
        />
        <StatCard
          title="Revenue This Month"
          value={formatCurrency(1534000)}
          icon={IndianRupee}
          color="emerald"
          trend={{ value: 22, positive: true }}
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

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Doctor Utilization</CardTitle>
            <CardDescription>Today&apos;s performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Doctor Name</TableHead>
                  <TableHead>Appts Today</TableHead>
                  <TableHead>Utilization</TableHead>
                  <TableHead>Rating</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {doctorUtilization.map((doc) => (
                  <TableRow key={doc.name}>
                    <TableCell className="font-medium">{doc.name}</TableCell>
                    <TableCell>{doc.appointmentsToday}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 rounded-full bg-muted">
                          <div
                            className="h-2 rounded-full bg-primary"
                            style={{ width: `${doc.utilization}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{doc.utilization}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                        <Star className="h-3 w-3 mr-1" />
                        {doc.rating}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Services</CardTitle>
            <CardDescription>Most booked services this month</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
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
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Performance vs Platform Average</CardTitle>
          <CardDescription>How your clinic compares to other clinics on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
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
    </div>
  );
}
