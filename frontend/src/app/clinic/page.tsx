"use client";

import { useState, useEffect } from "react";
import {
  CalendarDays, ListOrdered, Clock, CheckCircle2, IndianRupee, PhoneForwarded, Users, Timer,
} from "lucide-react";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/shared/stat-card";
import { Spinner } from "@/components/shared/spinner";
import { useAuth } from "@/lib/auth-context";
import { analytics, appointments as appointmentsApi, queue as queueApi } from "@/lib/api";

const statusColors: Record<string, string> = {
  scheduled: "bg-primary/10 text-primary dark:bg-primary/15",
  confirmed: "bg-primary/10 text-primary dark:bg-primary/15",
  in_progress: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  "in-progress": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  waiting: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function ClinicDashboard() {
  const { user, membership } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [todayApts, setTodayApts] = useState<any[]>([]);
  const [queueData, setQueueData] = useState<any[]>([]);
  const [queueStats, setQueueStats] = useState<any>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [dashStats, todayData, qData, qStats, trendData] = await Promise.all([
          analytics.dashboard().catch(() => null),
          appointmentsApi.getToday().catch(() => ({ appointments: [], stats: {} })),
          queueApi.get().catch(() => ({ queue: [] })),
          queueApi.stats().catch(() => null),
          analytics.trends(7).catch(() => ({ trends: [] })),
        ]);
        setStats(dashStats);
        setTodayApts((todayData as any)?.appointments || []);
        setQueueData((qData as any)?.queue || []);
        setQueueStats(qStats);
        setTrends((trendData as any)?.trends || []);
      } catch {}
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Spinner /></div>;
  }

  const firstName = user?.name?.split(" ")[0] || "Doctor";
  const clinicName = membership?.clinic_name || "Your Clinic";

  return (
    <div className="space-y-6">
      <div className="welcome-banner rounded-xl p-5 animate-fade-in-up">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Good morning, {firstName}</h1>
            <p className="text-muted-foreground mt-0.5">{clinicName} — Today&apos;s overview</p>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 rounded-full px-3 py-1">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse-soft" />
              Clinic Open
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Today's Appointments" value={stats?.today_appointments ?? 0} icon={CalendarDays} color="primary" />
        <StatCard title="Queue Length" value={queueStats?.waiting ?? 0} icon={ListOrdered} description="Currently waiting" color="amber" />
        <StatCard title="Avg Wait Time" value={`${queueStats?.avg_wait_minutes ?? 0} min`} icon={Clock} color="rose" />
        <StatCard title="Completed Today" value={stats?.completed_today ?? 0} icon={CheckCircle2} color="emerald" />
        <StatCard title="Today's Revenue" value={`₹${(stats?.today_revenue ?? 0).toLocaleString("en-IN")}`} icon={IndianRupee} color="accent" />
        <StatCard title="Pending Follow-ups" value={stats?.pending_follow_ups ?? 0} icon={PhoneForwarded} description="Due this week" color="violet" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base section-header">Weekly Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trends} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} className="text-xs fill-muted-foreground" tickFormatter={(v) => new Date(v).toLocaleDateString("en-IN", { weekday: "short" })} />
                  <YAxis tickLine={false} axisLine={false} className="text-xs fill-muted-foreground" />
                  <Tooltip contentStyle={{ backgroundColor: "var(--popover)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px" }} />
                  <Bar dataKey="count" name="Appointments" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base section-header">Live Queue Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border p-3 text-center">
                <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
                  <Users className="h-3.5 w-3.5" /><span className="text-xs">In Queue</span>
                </div>
                <p className="text-2xl font-bold">{queueStats?.waiting ?? 0}</p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
                  <Timer className="h-3.5 w-3.5" /><span className="text-xs">Avg Wait</span>
                </div>
                <p className="text-2xl font-bold">{queueStats?.avg_wait_minutes ?? 0} min</p>
              </div>
            </div>
            <div className="space-y-2">
              {queueData.slice(0, 3).map((item: any, i: number) => (
                <div key={item.id || i} className="flex items-center gap-3 rounded-lg border p-2.5">
                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${item.status === "in_progress" ? "bg-accent/10 text-accent" : "bg-primary text-primary-foreground"}`}>
                    {item.token_number}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{item.patient_name}</p>
                    <p className="text-xs text-muted-foreground">{item.doctor_name}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{item.estimated_wait ?? 0} min</span>
                </div>
              ))}
              {queueData.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No patients in queue</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="text-base section-header">Today&apos;s Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {todayApts.slice(0, 5).map((apt: any) => (
              <div key={apt.id} className="flex items-center gap-4 rounded-lg border p-3 transition-colors hover:bg-muted/50">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-semibold text-sm">
                  {apt.start_time?.slice(0, 5)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm">{apt.patient_name}</p>
                  <p className="text-xs text-muted-foreground">{apt.doctor_name} &middot; {apt.type}</p>
                </div>
                <Badge variant="secondary" className={statusColors[apt.status] || ""}>
                  {apt.status?.replace("_", " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                </Badge>
              </div>
            ))}
            {todayApts.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No appointments today</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
