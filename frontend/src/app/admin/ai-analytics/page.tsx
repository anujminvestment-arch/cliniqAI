"use client";

import { useState, useEffect } from "react";
import { Phone, CheckCircle, Clock } from "lucide-react";
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatCard } from "@/components/shared/stat-card";
import { Spinner } from "@/components/shared/spinner";
import { analytics } from "@/lib/api";

function averageDuration(data: any[]): string {
  if (data.length === 0) return "0m 00s";
  let totalSeconds = 0;
  for (const day of data) {
    const parts = (day.duration || "").match(/(\d+)m\s*(\d+)s/);
    if (parts) {
      totalSeconds += parseInt(parts[1]) * 60 + parseInt(parts[2]);
    }
  }
  const avg = Math.round(totalSeconds / data.length);
  const minutes = Math.floor(avg / 60);
  const seconds = avg % 60;
  return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
}

export default function AIAnalyticsPage() {
  const [aiCallAnalytics, setAiCallAnalytics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await analytics.dashboard();
        setAiCallAnalytics((data as any).aiCallAnalytics || []);
      } catch (err) {
        console.error("Failed to load AI analytics:", err);
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

  const totalCalls = aiCallAnalytics.reduce((sum: number, day: any) => sum + (day.calls || 0), 0);
  const totalBooked = aiCallAnalytics.reduce((sum: number, day: any) => sum + (day.booked || 0), 0);
  const bookingRate = totalCalls > 0 ? ((totalBooked / totalCalls) * 100).toFixed(1) : "0.0";
  const avgDuration = averageDuration(aiCallAnalytics);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight section-header">AI Analytics</h1>
        <p className="text-muted-foreground">
          AI voice call performance and booking metrics
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Calls This Week"
          value={totalCalls}
          icon={Phone}
          trend={{ value: 15, positive: true }}
        />
        <StatCard
          title="Booking Success Rate"
          value={`${bookingRate}%`}
          icon={CheckCircle}
          trend={{ value: 3, positive: true }}
        />
        <StatCard
          title="Avg Duration"
          value={avgDuration}
          icon={Clock}
          description="Average across all calls this week"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold section-header">
            Calls vs Bookings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={aiCallAnalytics}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
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
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="calls"
                  name="Total Calls"
                  stroke="#0891B2"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#0891B2" }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="booked"
                  name="Bookings"
                  stroke="#059669"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#059669" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="text-base font-semibold section-header">
            Daily AI Call Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table className="table-enhanced">
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Total Calls</TableHead>
                <TableHead className="text-right">Bookings</TableHead>
                <TableHead className="text-right">Success Rate</TableHead>
                <TableHead className="text-right">Avg Duration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {aiCallAnalytics.map((day: any) => {
                const successRate = (day.calls || 0) > 0 ? (((day.booked || 0) / (day.calls || 1)) * 100).toFixed(1) : "0.0";
                return (
                  <TableRow key={day.date}>
                    <TableCell className="font-medium">{day.date}</TableCell>
                    <TableCell className="text-right">{day.calls}</TableCell>
                    <TableCell className="text-right">{day.booked}</TableCell>
                    <TableCell className="text-right">{successRate}%</TableCell>
                    <TableCell className="text-right">{day.duration}</TableCell>
                  </TableRow>
                );
              })}
              {aiCallAnalytics.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No AI call data available
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
