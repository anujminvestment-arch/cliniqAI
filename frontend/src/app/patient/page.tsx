"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CalendarPlus,
  FileText,
  CreditCard,
  CalendarDays,
  Clock,
  MapPin,
  User,
  Stethoscope,
  Pill,
  Heart,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/shared/spinner";
import { useAuth } from "@/lib/auth-context";
import { appointments, queue, prescriptions as prescriptionsApi, patients } from "@/lib/api";

export default function PatientDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [queueStatus, setQueueStatus] = useState<any>(null);
  const [latestPrescription, setLatestPrescription] = useState<any>(null);

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [aptsRes, queueRes, rxRes] = await Promise.all([
          appointments.list({ status: "confirmed" }),
          queue.stats().catch(() => null),
          prescriptionsApi.list({ limit: 1 }),
        ]);
        setUpcomingAppointments(aptsRes.appointments || []);
        setQueueStatus(queueRes);
        const rxList = rxRes.prescriptions || [];
        setLatestPrescription(rxList.length > 0 ? rxList[0] : null);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
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

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="welcome-banner rounded-xl p-5 animate-fade-in-up">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Welcome back{user?.name ? `, ${user.name}` : ""}</h1>
            <p className="text-muted-foreground mt-0.5">{today}</p>
          </div>
          <div className="hidden sm:flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
            <Heart className="h-5.5 w-5.5 text-primary" />
          </div>
        </div>
      </div>

      {/* Queue Status Alert */}
      {queueStatus && queueStatus.position && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex flex-wrap items-center gap-4 pt-5">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg">
                  {queueStatus.position}
                </div>
                <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3 animate-glow-pulse">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-primary" />
                </span>
              </div>
              <div>
                <p className="font-semibold">You are #{queueStatus.position} in line</p>
                <p className="text-sm text-muted-foreground">
                  {queueStatus.doctor} &middot; Est. wait: {queueStatus.estimatedWait || queueStatus.estimated_wait}
                </p>
              </div>
            </div>
            <Link href="/patient/queue" className="ml-auto">
              <Button variant="outline" size="sm" className="cursor-pointer">
                View Queue
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Appointments */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Upcoming Appointments</h2>
          <Link href="/patient/appointments">
            <Button variant="ghost" size="sm" className="cursor-pointer text-muted-foreground">
              View All
            </Button>
          </Link>
        </div>
        {upcomingAppointments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <CalendarDays className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="font-medium">No upcoming appointments</p>
              <p className="text-sm text-muted-foreground">Book an appointment to get started</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {upcomingAppointments.slice(0, 4).map((apt) => (
              <Card key={apt.id}>
                <CardContent className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <Stethoscope className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{apt.doctor || apt.doctor_name}</p>
                      </div>
                    </div>
                    <Badge variant="secondary">Confirmed</Badge>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {new Date(apt.date || apt.appointment_date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      {apt.time || apt.start_time}
                    </span>
                    {(apt.clinic || apt.clinic_name) && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        {apt.clinic || apt.clinic_name}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Link href="/patient/book">
            <Card className="cursor-pointer card-hover">
              <CardContent className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <CalendarPlus className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Book Appointment</p>
                  <p className="text-sm text-muted-foreground">Schedule a visit</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/patient/records">
            <Card className="cursor-pointer card-hover">
              <CardContent className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                  <FileText className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="font-medium">View Records</p>
                  <p className="text-sm text-muted-foreground">Medical history</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/patient/billing">
            <Card className="cursor-pointer card-hover">
              <CardContent className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-violet-500/10">
                  <CreditCard className="h-6 w-6 text-violet-500" />
                </div>
                <div>
                  <p className="font-medium">Pay Invoice</p>
                  <p className="text-sm text-muted-foreground">View billing</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Recent Prescription */}
      {latestPrescription && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Prescription</h2>
            <Link href="/patient/prescriptions">
              <Button variant="ghost" size="sm" className="cursor-pointer text-muted-foreground">
                View All
              </Button>
            </Link>
          </div>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                    <Pill className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{latestPrescription.doctor || latestPrescription.doctor_name}</CardTitle>
                    <CardDescription>
                      {new Date(latestPrescription.date || latestPrescription.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {latestPrescription.medicines && (
                <ul className="space-y-1.5">
                  {latestPrescription.medicines.map((med: any, idx: number) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      {typeof med === "string" ? med : med.name}
                    </li>
                  ))}
                </ul>
              )}
              {latestPrescription.notes && (
                <p className="text-sm text-muted-foreground pt-2 border-t">
                  {latestPrescription.notes}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
