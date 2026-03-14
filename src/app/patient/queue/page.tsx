"use client";

import {
  Clock,
  Stethoscope,
  Users,
  User,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { patientPortal } from "@/lib/mock-data";

const queueVisualization = [
  { position: 1, name: "Patient A", status: "in-progress" },
  { position: 2, name: "Patient B", status: "waiting" },
  { position: 3, name: "Vikram Singh", status: "you" },
  { position: 4, name: "Patient D", status: "waiting" },
  { position: 5, name: "Patient E", status: "waiting" },
];

export default function QueueStatusPage() {
  const { queueStatus } = patientPortal;
  const totalInQueue = queueStatus.position + 2;
  const progressValue = ((totalInQueue - queueStatus.position) / totalInQueue) * 100;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight section-header">Queue Status</h1>
        <p className="text-muted-foreground">Track your position in the queue</p>
      </div>

      {/* Main Queue Position Display */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="flex flex-col items-center justify-center py-10 space-y-6">
          {/* Large Position Number */}
          <div className="relative">
            <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-primary bg-background">
              <span className="text-5xl font-bold text-primary">
                {queueStatus.position}
              </span>
            </div>
            <span className="absolute -top-1 -right-1 flex h-5 w-5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60" />
              <span className="relative inline-flex h-5 w-5 rounded-full bg-primary" />
            </span>
          </div>

          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold">
              You are #{queueStatus.position} in line
            </h2>
            <p className="text-muted-foreground">
              {queueStatus.ahead} {queueStatus.ahead === 1 ? "person" : "people"} ahead of you
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="w-full max-w-sm space-y-2">
            <Progress value={progressValue} />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Joined queue</span>
              <span>Your turn</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Stethoscope className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Doctor</p>
              <p className="font-medium">{queueStatus.doctor}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Estimated Wait</p>
              <p className="font-medium">{queueStatus.estimatedWait}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ahead of You</p>
              <p className="font-medium">{queueStatus.ahead} patients</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Queue Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Queue Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {queueVisualization.map((item) => (
              <div
                key={item.position}
                className={`flex items-center gap-4 rounded-lg p-3 transition-colors ${
                  item.status === "you"
                    ? "bg-primary/10 ring-1 ring-primary/30"
                    : item.status === "in-progress"
                      ? "bg-accent/10"
                      : "bg-muted/50"
                }`}
              >
                {/* Position */}
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    item.status === "you"
                      ? "bg-primary text-primary-foreground"
                      : item.status === "in-progress"
                        ? "bg-accent text-accent-foreground"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {item.position}
                </div>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`font-medium truncate ${
                      item.status === "you" ? "text-primary" : ""
                    }`}
                  >
                    {item.name}
                    {item.status === "you" && (
                      <span className="text-xs ml-2">(You)</span>
                    )}
                  </p>
                </div>

                {/* Status Badge */}
                <Badge
                  variant={
                    item.status === "in-progress"
                      ? "default"
                      : item.status === "you"
                        ? "secondary"
                        : "outline"
                  }
                >
                  {item.status === "in-progress"
                    ? "In Progress"
                    : item.status === "you"
                      ? "Waiting (You)"
                      : "Waiting"}
                </Badge>

                {/* Pulsing indicator for current patient */}
                {item.status === "you" && (
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
    </div>
  );
}
