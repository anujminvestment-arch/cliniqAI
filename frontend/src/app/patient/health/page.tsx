"use client";

import { useState, useEffect } from "react";
import {
  Heart,
  Activity,
  Droplets,
  Weight,
  Pill,
  TestTube,
  FileText,
  TrendingUp,
  AlertTriangle,
  Gauge,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
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
import { Spinner } from "@/components/shared/spinner";
import { patients, users } from "@/lib/api";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";

const bpConfig = {
  systolic: { label: "Systolic", color: "var(--chart-1)" },
  diastolic: { label: "Diastolic", color: "var(--chart-2)" },
};

const weightConfig = {
  weight: { label: "Weight (kg)", color: "var(--chart-3)" },
};

const sugarConfig = {
  fasting: { label: "Fasting", color: "var(--chart-4)" },
  postMeal: { label: "Post-Meal", color: "var(--chart-5)" },
};

function HealthScoreRing({ score }: { score: number }) {
  const color = score >= 80 ? "text-emerald-500" : score >= 60 ? "text-amber-500" : "text-red-500";
  const label = score >= 80 ? "Good" : score >= 60 ? "Fair" : "Needs Attention";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-32 w-32">
        <svg className="h-32 w-32 -rotate-90" viewBox="0 0 128 128">
          <circle cx="64" cy="64" r="56" fill="none" className="stroke-muted" strokeWidth="8" />
          <circle
            cx="64"
            cy="64"
            r="56"
            fill="none"
            className={`${color.replace("text-", "stroke-")}`}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${(score / 100) * 352} 352`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold">{score}</span>
          <span className="text-xs text-muted-foreground">/ 100</span>
        </div>
      </div>
      <Badge variant="secondary" className={
        score >= 80
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
          : score >= 60
            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
      }>
        {label}
      </Badge>
    </div>
  );
}

export default function HealthPage() {
  const [loading, setLoading] = useState(true);
  const [healthData, setHealthData] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [patientRes, profileRes] = await Promise.all([
          patients.getMe(),
          users.getProfile(),
        ]);
        setHealthData((patientRes as any).health || patientRes);
        setProfileData(profileRes);
      } catch (err) {
        console.error("Failed to load health data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  const healthScore = healthData?.healthScore || healthData?.health_score || 0;
  const allergies = profileData?.allergies || healthData?.allergies || [];
  const conditions = profileData?.conditions || healthData?.conditions || [];
  const bpHistory = healthData?.bpHistory || healthData?.bp_history || [];
  const weightHistory = healthData?.weightHistory || healthData?.weight_history || [];
  const sugarHistory = healthData?.sugarHistory || healthData?.sugar_history || [];
  const currentMedications = healthData?.currentMedications || healthData?.current_medications || [];
  const upcomingTests = healthData?.upcomingTests || healthData?.upcoming_tests || [];
  const doctorNotes = healthData?.doctorNotes || healthData?.doctor_notes || [];

  return (
    <div className="space-y-6">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/patient">Dashboard</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>Health</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div>
        <h1 className="text-2xl font-bold tracking-tight section-header">Health Overview</h1>
        <p className="text-muted-foreground">Track your vitals, medications, and wellness</p>
      </div>

      {/* Health Score + Allergies + Conditions */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="animate-fade-in-up flex flex-col items-center justify-center">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-base flex items-center gap-2 justify-center">
              <Gauge className="h-4 w-4 text-primary" />
              Health Score
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-6">
            <HealthScoreRing score={healthScore} />
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up delay-100">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Allergies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {allergies.length === 0 ? (
                <p className="text-sm text-muted-foreground">No known allergies</p>
              ) : (
                allergies.map((a: string) => (
                  <div key={a} className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-900/10 px-3 py-2">
                    <span className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
                    <span className="text-sm font-medium text-red-700 dark:text-red-400">{a}</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up delay-200">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Heart className="h-4 w-4 text-primary" />
              Conditions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {conditions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No chronic conditions</p>
              ) : (
                conditions.map((c: string) => (
                  <div key={c} className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
                    <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                    <span className="text-sm">{c}</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* BP Chart */}
      {bpHistory.length > 0 && (
        <Card className="animate-fade-in-up delay-100">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Blood Pressure Trend
            </CardTitle>
            <CardDescription>Systolic / Diastolic over 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={bpConfig} className="h-[250px] w-full">
              <LineChart data={bpHistory}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" domain={[60, 150]} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="systolic" stroke="var(--chart-1)" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="diastolic" stroke="var(--chart-2)" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Weight */}
        {weightHistory.length > 0 && (
          <Card className="animate-fade-in-up delay-200">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Weight className="h-4 w-4 text-accent" />
                Weight Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={weightConfig} className="h-[200px] w-full">
                <AreaChart data={weightHistory}>
                  <defs>
                    <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--chart-3)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="var(--chart-3)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" domain={[74, 80]} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="weight" stroke="var(--chart-3)" fill="url(#weightGrad)" strokeWidth={2} />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {/* Blood Sugar */}
        {sugarHistory.length > 0 && (
          <Card className="animate-fade-in-up delay-300">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Droplets className="h-4 w-4 text-amber-500" />
                Blood Sugar Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={sugarConfig} className="h-[200px] w-full">
                <LineChart data={sugarHistory}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="fasting" stroke="var(--chart-4)" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="postMeal" stroke="var(--chart-5)" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Current Medications */}
      {currentMedications.length > 0 && (
        <Card className="animate-fade-in-up delay-400">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Pill className="h-4 w-4 text-primary" />
              Current Medications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3">
              {currentMedications.map((med: any) => (
                <div key={med.name} className="rounded-lg bg-muted/50 p-4">
                  <p className="font-medium text-sm">{med.name}</p>
                  <p className="text-xs text-muted-foreground">{med.dosage} &middot; {med.frequency}</p>
                  <Badge variant="outline" className="mt-2 text-[10px]">
                    {med.remaining} remaining
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Upcoming Tests */}
        {upcomingTests.length > 0 && (
          <Card className="animate-fade-in-up delay-500">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TestTube className="h-4 w-4 text-violet-500" />
                Upcoming Tests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingTests.map((test: any) => (
                  <div key={test.test || test.name} className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium">{test.test || test.name}</p>
                      <p className="text-xs text-muted-foreground">{test.lab}</p>
                    </div>
                    <Badge variant="secondary">{test.date}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Doctor Notes */}
        {doctorNotes.length > 0 && (
          <Card className="animate-fade-in-up delay-600">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Recent Doctor Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {doctorNotes.map((note: any, i: number) => (
                  <div key={i} className="rounded-lg bg-primary/5 border border-primary/10 p-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold text-primary">{note.doctor || note.doctor_name}</p>
                      <span className="text-xs text-muted-foreground">{note.date}</span>
                    </div>
                    <p className="text-sm">{note.note || note.content}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
