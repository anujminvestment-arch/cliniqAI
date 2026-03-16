"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Clock,
  Stethoscope,
  Users,
  RefreshCw,
  CalendarPlus,
  PartyPopper,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/shared/spinner";
import { queue } from "@/lib/api";
import { useSocketEvent } from "@/hooks/use-socket";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";

export default function PatientQueuePage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [secondsAgo, setSecondsAgo] = useState(0);
  const [lastFetch, setLastFetch] = useState(Date.now());

  const fetchData = useCallback(async () => {
    try {
      const res: any = await queue.myPosition();
      setData(res);
      setLastFetch(Date.now());
      setSecondsAgo(0);
    } catch {
      setData({ in_queue: false });
    } finally {
      setLoading(false);
    }
  }, []);

  // Real-time position updates
  const handleQueueUpdate = useCallback(() => {
    fetchData();  // Refetch immediately on any queue change
  }, [fetchData]);

  const handlePositionUpdate = useCallback((posData: any) => {
    // Direct position update for this patient
    if (posData?.position !== undefined) {
      setData((prev: any) => prev ? { ...prev, position: posData.position, estimated_wait: posData.estimated_wait, patients_ahead: posData.position - 1 } : prev);
    }
  }, []);

  useSocketEvent("queue:updated", handleQueueUpdate);
  useSocketEvent("queue:position", handlePositionUpdate);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Seconds ago counter
  useEffect(() => {
    const tick = setInterval(() => {
      setSecondsAgo(Math.floor((Date.now() - lastFetch) / 1000));
    }, 1000);
    return () => clearInterval(tick);
  }, [lastFetch]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Spinner size="lg" /></div>;
  }

  if (!data?.in_queue) {
    return (
      <div className="space-y-6">
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink href="/patient">Dashboard</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage>Queue Status</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div>
          <h1 className="text-2xl font-bold tracking-tight section-header">Queue Status</h1>
          <p className="text-muted-foreground">Track your position in the doctor&apos;s queue</p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
            <Users className="h-16 w-16 text-muted-foreground/30" />
            <div>
              <p className="text-lg font-semibold">Not in any queue</p>
              <p className="text-sm text-muted-foreground mt-1">You&apos;ll see your queue status here after checking in for an appointment</p>
            </div>
            <Link href="/patient/book">
              <Button className="cursor-pointer mt-2">
                <CalendarPlus className="h-4 w-4 mr-1.5" />
                Book an Appointment
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const position = data.position || 0;
  const ahead = data.patients_ahead || 0;
  const isNext = ahead === 0 && data.status === "waiting";
  const isWithDoctor = data.status === "in_progress";
  const totalInQueue = (data.queue || []).length;
  const progressValue = totalInQueue > 0 ? ((totalInQueue - ahead) / totalInQueue) * 100 : 100;

  return (
    <div className="space-y-6">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/patient">Dashboard</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>Queue Status</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight section-header">Queue Status</h1>
          <p className="text-muted-foreground">
            {data.doctor_name} &middot; {data.doctor_specialization || "Consultation"}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          Live &middot; {secondsAgo}s ago
        </div>
      </div>

      {/* Main Position Display */}
      <Card className={`overflow-hidden ${isWithDoctor ? "border-emerald-500/50 bg-emerald-500/5" : isNext ? "border-amber-500/50 bg-amber-500/5" : "border-primary/30 bg-primary/5"}`}>
        <CardContent className="flex flex-col items-center justify-center py-10 space-y-6">
          {isWithDoctor ? (
            <>
              <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-emerald-500 bg-emerald-500/10">
                <Stethoscope className="h-14 w-14 text-emerald-500" />
              </div>
              <div className="text-center space-y-1">
                <h2 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">With Doctor Now</h2>
                <p className="text-muted-foreground">Your consultation is in progress</p>
              </div>
            </>
          ) : isNext ? (
            <>
              <div className="relative">
                <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-amber-500 bg-amber-500/10 animate-pulse">
                  <PartyPopper className="h-14 w-14 text-amber-500" />
                </div>
              </div>
              <div className="text-center space-y-1">
                <h2 className="text-2xl font-bold text-amber-600 dark:text-amber-400">You&apos;re Next!</h2>
                <p className="text-muted-foreground">Please be ready, the doctor will see you shortly</p>
              </div>
            </>
          ) : (
            <>
              <div className="relative">
                <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-primary bg-background">
                  <span className="text-5xl font-bold text-primary">{position}</span>
                </div>
                <span className="absolute -top-1 -right-1 flex h-5 w-5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60" />
                  <span className="relative inline-flex h-5 w-5 rounded-full bg-primary" />
                </span>
              </div>
              <div className="text-center space-y-1">
                <h2 className="text-2xl font-bold">You are #{position} in line</h2>
                <p className="text-muted-foreground">{ahead} {ahead === 1 ? "patient" : "patients"} ahead of you</p>
              </div>
            </>
          )}

          {!isWithDoctor && (
            <div className="w-full max-w-sm space-y-2">
              <Progress value={progressValue} />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Joined queue</span>
                <span>Your turn</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 pt-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Stethoscope className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Doctor</p>
              <p className="font-medium text-sm">{data.doctor_name}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Est. Wait</p>
              <p className="font-medium text-sm">{data.estimated_wait ? `~${data.estimated_wait} min` : "N/A"}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/30">
              <span className="text-lg font-bold text-violet-600 dark:text-violet-400">#{data.token_number}</span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Your Token</p>
              <p className="font-medium text-sm">Token #{data.token_number}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Doctor's Queue List */}
      {data.queue && data.queue.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{data.doctor_name}&apos;s Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.queue.map((item: any, i: number) => (
                <div
                  key={item.id || i}
                  className={`flex items-center gap-4 rounded-lg p-3 transition-colors ${
                    item.is_you
                      ? "bg-primary/10 ring-1 ring-primary/30"
                      : item.status === "in_progress"
                        ? "bg-emerald-500/10"
                        : "bg-muted/50"
                  }`}
                >
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    item.is_you ? "bg-primary text-primary-foreground"
                      : item.status === "in_progress" ? "bg-emerald-500 text-white"
                        : "bg-muted text-muted-foreground"
                  }`}>
                    {item.token_number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm truncate ${item.is_you ? "text-primary" : ""}`}>
                      {item.is_you ? "You" : item.patient_name}
                    </p>
                  </div>
                  <Badge variant={item.status === "in_progress" ? "default" : item.is_you ? "secondary" : "outline"}>
                    {item.status === "in_progress" ? "With Doctor" : item.is_you ? "You" : "Waiting"}
                  </Badge>
                  {item.is_you && (
                    <span className="flex h-3 w-3 shrink-0">
                      <span className="absolute inline-flex h-3 w-3 animate-ping rounded-full bg-primary/60" />
                      <span className="relative inline-flex h-3 w-3 rounded-full bg-primary" />
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
