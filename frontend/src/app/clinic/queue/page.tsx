"use client";

import { useState, useEffect, useCallback } from "react";
import {
  RefreshCw,
  Users,
  Timer,
  Clock,
  ExternalLink,
  Copy,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { queue as queueApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useSocketEvent } from "@/hooks/use-socket";
import { Spinner } from "@/components/shared/spinner";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";

export default function QueuePage() {
  const { membership } = useAuth();
  const [queueData, setQueueData] = useState<any[]>([]);
  const [queueStats, setQueueStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [secondsAgo, setSecondsAgo] = useState(0);
  const [lastFetch, setLastFetch] = useState(Date.now());

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [queueRes, statsRes] = await Promise.all([
        queueApi.get(),
        queueApi.stats(),
      ]);
      setQueueData(queueRes.queue || []);
      setQueueStats(statsRes);
      setLastFetch(Date.now());
      setSecondsAgo(0);
    } catch (err: any) {
      setError(err.message || "Failed to load queue data");
    } finally {
      setLoading(false);
    }
  }, []);

  // Real-time queue updates via Socket.IO
  const handleQueueUpdate = useCallback((data: any) => {
    console.log("[Queue] Real-time update received", data);
    fetchData();  // Refetch on any queue change
  }, [fetchData]);

  useSocketEvent("queue:updated", handleQueueUpdate);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    fetchData();
    const interval = setInterval(() => { fetchData(); }, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Seconds ago counter
  useEffect(() => {
    const tick = setInterval(() => setSecondsAgo(Math.floor((Date.now() - lastFetch) / 1000)), 1000);
    return () => clearInterval(tick);
  }, [lastFetch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <p className="text-destructive font-medium">{error}</p>
        <Button variant="outline" onClick={() => fetchData()}>
          Retry
        </Button>
      </div>
    );
  }

  const totalInQueue = queueData.length;
  const avgWait = queueStats?.average_wait_time || "-- min";
  const nextAvailable = queueStats?.next_available_slot || "--";

  return (
    <div className="space-y-6">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/clinic">Dashboard</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>Queue</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight section-header">Live Queue</h1>
          <div className="flex items-center gap-3">
            <p className="text-muted-foreground">Real-time patient queue management</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              Live &middot; {secondsAgo}s ago
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" className="cursor-pointer" onClick={() => fetchData()}>
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Refresh
          </Button>
          <Button variant="outline" className="cursor-pointer" onClick={() => window.open(`/queue-tv?clinic=${membership?.clinic_slug || ""}`, "_blank")}>
            <ExternalLink className="h-4 w-4 mr-1.5" />
            TV Display
          </Button>
          <Button variant="outline" className="cursor-pointer" onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/queue-tv?clinic=${membership?.clinic_slug || ""}`); alert("Queue TV link copied!"); }}>
            <Copy className="h-4 w-4 mr-1.5" />
            Share Link
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total in Queue</p>
              <p className="text-2xl font-bold">{totalInQueue}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <Timer className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Average Wait</p>
              <p className="text-2xl font-bold">{avgWait}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
              <Clock className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Next Available Slot</p>
              <p className="text-2xl font-bold">{nextAvailable}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {queueData.map((item) => {
          const isInProgress = item.status === "in-progress";
          return (
            <Card
              key={item.position || item.id}
              className={`relative overflow-hidden transition-all ${
                isInProgress
                  ? "border-green-500 dark:border-green-400 shadow-sm"
                  : ""
              }`}
            >
              {isInProgress && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-green-500" />
              )}
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-bold ${
                      isInProgress
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {item.position}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm truncate">{item.patient_name || item.patient}</h3>
                      {isInProgress && (
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{item.doctor_name || item.doctor}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {item.type}
                      </Badge>
                      <span
                        className={`text-sm font-medium ${
                          isInProgress
                            ? "text-green-600 dark:text-green-400"
                            : "text-muted-foreground"
                        }`}
                      >
                        {item.wait_time || item.waitTime}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {queueData.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No patients in the queue right now.
          </div>
        )}
      </div>
    </div>
  );
}
