"use client";

import {
  RefreshCw,
  Users,
  Timer,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { queueData } from "@/lib/mock-data";

export default function QueuePage() {
  const totalInQueue = queueData.length;
  const avgWait = "22 min";
  const nextAvailable = "12:30 PM";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight section-header">Live Queue</h1>
          <p className="text-muted-foreground">Real-time patient queue management</p>
        </div>
        <Button variant="outline" className="cursor-pointer w-fit">
          <RefreshCw className="h-4 w-4 mr-1.5" />
          Refresh
        </Button>
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
              key={item.position}
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
                      <h3 className="font-semibold text-sm truncate">{item.patient}</h3>
                      {isInProgress && (
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{item.doctor}</p>
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
                        {item.waitTime}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
