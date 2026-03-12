"use client";

import {
  CalendarDays,
  ListOrdered,
  Clock,
  CheckCircle2,
  IndianRupee,
  PhoneForwarded,
  Users,
  Timer,
} from "lucide-react";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/shared/stat-card";
import {
  clinicDashboard,
  appointmentsList,
  queueData,
  weeklyAppointments,
} from "@/lib/mock-data";

const statusColors: Record<string, string> = {
  confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  "in-progress": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  waiting: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function ClinicDashboard() {
  const todayAppointments = appointmentsList.slice(0, 5);
  const inQueue = queueData.length;
  const avgWait = "18 min";
  const nextSlot = "12:30 PM";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">SmileCare Dental — Today&apos;s overview</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          title="Today's Appointments"
          value={clinicDashboard.todayAppointments}
          icon={CalendarDays}
          trend={{ value: 12, positive: true }}
        />
        <StatCard
          title="Queue Length"
          value={clinicDashboard.queueLength}
          icon={ListOrdered}
          description="Currently waiting"
        />
        <StatCard
          title="Avg Wait Time"
          value={clinicDashboard.avgWaitTime}
          icon={Clock}
          trend={{ value: 8, positive: false }}
        />
        <StatCard
          title="Completed Today"
          value={clinicDashboard.completedToday}
          icon={CheckCircle2}
          trend={{ value: 5, positive: true }}
        />
        <StatCard
          title="Today's Revenue"
          value={`₹${clinicDashboard.revenue.toLocaleString("en-IN")}`}
          icon={IndianRupee}
          trend={{ value: 18, positive: true }}
        />
        <StatCard
          title="Pending Follow-ups"
          value={clinicDashboard.followUps}
          icon={PhoneForwarded}
          description="Due this week"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Weekly Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyAppointments} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    className="text-xs fill-muted-foreground"
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    className="text-xs fill-muted-foreground"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    labelStyle={{ fontWeight: 600 }}
                  />
                  <Bar
                    dataKey="count"
                    name="Appointments"
                    fill="var(--primary)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Live Queue Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border p-3 text-center">
                <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
                  <Users className="h-3.5 w-3.5" />
                  <span className="text-xs">In Queue</span>
                </div>
                <p className="text-2xl font-bold">{inQueue}</p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
                  <Timer className="h-3.5 w-3.5" />
                  <span className="text-xs">Avg Wait</span>
                </div>
                <p className="text-2xl font-bold">{avgWait}</p>
              </div>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Next Available Slot</p>
              <p className="text-lg font-semibold">{nextSlot}</p>
            </div>
            <div className="space-y-2">
              {queueData.slice(0, 3).map((item) => (
                <div
                  key={item.position}
                  className="flex items-center gap-3 rounded-lg border p-2.5"
                >
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      item.status === "in-progress"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {item.position}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{item.patient}</p>
                    <p className="text-xs text-muted-foreground">{item.doctor}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {item.waitTime}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Today&apos;s Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {todayAppointments.map((apt) => (
              <div
                key={apt.id}
                className="flex items-center gap-4 rounded-lg border p-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted font-semibold text-sm">
                  {apt.time.split(" ")[0]}
                  <span className="text-[10px] ml-0.5">{apt.time.split(" ")[1]}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm">{apt.patient}</p>
                  <p className="text-xs text-muted-foreground">
                    {apt.doctor} &middot; {apt.type}
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className={statusColors[apt.status]}
                >
                  {apt.status === "in-progress" ? "In Progress" : apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
