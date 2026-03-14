"use client";

import { useState } from "react";
import {
  Stethoscope,
  Users,
  Calendar,
  Clock,
  MapPin,
  Star,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { StatCard } from "@/components/shared/stat-card";
import { doctorsList, doctorPerformance, branchesList } from "@/lib/mock-data";

const statusColors: Record<string, string> = {
  available: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  "in-consultation": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  "off-duty": "bg-gray-100 text-gray-600 dark:bg-gray-800/50 dark:text-gray-400",
};

const statusDots: Record<string, string> = {
  available: "bg-emerald-500",
  "in-consultation": "bg-amber-500",
  "off-duty": "bg-gray-400",
};

export default function DoctorsPage() {
  const totalDoctors = doctorsList.length;
  const availableDoctors = doctorsList.filter((d) => d.status === "available").length;
  const totalPatients = doctorsList.reduce((sum, d) => sum + d.patients, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight section-header">Doctors</h1>
        <p className="text-muted-foreground">Doctor profiles, schedules, and performance</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Total Doctors" value={totalDoctors} icon={Stethoscope} color="primary" />
        <StatCard title="Available Now" value={availableDoctors} icon={Clock} color="emerald" />
        <StatCard title="Total Patients" value={totalPatients.toLocaleString()} icon={Users} color="accent" />
      </div>

      {/* Doctor Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {doctorsList.map((doctor, i) => {
          const initials = doctor.name.replace("Dr. ", "").split(" ").map((n) => n[0]).join("");
          const perf = doctorPerformance.find((p) => p.name === doctor.name);

          return (
            <Card
              key={doctor.id}
              className="card-hover animate-fade-in-up overflow-hidden"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-4 mb-4">
                  <Avatar className="h-14 w-14 text-lg">
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{doctor.name}</h3>
                      <div className="relative">
                        <span className={`absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full ${statusDots[doctor.status]} ring-2 ring-background`} />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
                    <Badge variant="secondary" className={`mt-1 text-[10px] ${statusColors[doctor.status]}`}>
                      {doctor.status.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    {doctor.patients} patients
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    {doctor.schedule.split(" ")[0]}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                    <Clock className="h-3.5 w-3.5" />
                    {doctor.schedule.split(" ").slice(1).join(" ")}
                  </div>
                </div>

                {perf && (
                  <div className="space-y-3 pt-3 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Performance</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                        <span className="font-medium">{perf.rating}</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Completion Rate</span>
                        <span className="font-medium">{perf.completionRate}%</span>
                      </div>
                      <Progress value={perf.completionRate} className="h-1.5" />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Monthly Revenue</span>
                      <span className="font-medium flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-emerald-500" />
                        ₹{(perf.revenue / 1000).toFixed(0)}K
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Branch Assignments */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Branch Assignments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            {branchesList.map((branch) => (
              <div key={branch.id} className="rounded-lg bg-muted/50 p-3">
                <p className="font-medium text-sm">{branch.name}</p>
                <p className="text-xs text-muted-foreground mb-2">{branch.address}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{branch.doctors} doctors</span>
                  <Badge variant={branch.status === "open" ? "secondary" : "outline"} className={
                    branch.status === "open"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px]"
                      : "text-[10px]"
                  }>
                    {branch.status.charAt(0).toUpperCase() + branch.status.slice(1)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
