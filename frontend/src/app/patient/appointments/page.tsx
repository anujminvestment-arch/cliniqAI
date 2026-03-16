"use client";

import { useState, useEffect } from "react";
import {
  CalendarDays,
  Clock,
  MapPin,
  Stethoscope,
  X,
  FileText,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Spinner } from "@/components/shared/spinner";
import { Pagination } from "@/components/shared/pagination";
import { appointments } from "@/lib/api";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";

export default function AppointmentsPage() {
  const [loading, setLoading] = useState(true);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [pastAppointments, setPastAppointments] = useState<any[]>([]);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const PAGE_SIZE = 20;

  useEffect(() => {
    async function fetchData() {
      try {
        const [upcomingRes, pastRes] = await Promise.all([
          appointments.list({ status: "confirmed", limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE }),
          appointments.list({ status: "completed", limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE }),
        ]);
        setUpcomingAppointments(upcomingRes.appointments || []);
        setPastAppointments(pastRes.appointments || []);
        setTotal(upcomingRes.total || pastRes.total || (upcomingRes.appointments?.length || 0) + (pastRes.appointments?.length || 0));
      } catch (err) {
        console.error("Failed to load appointments:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [page]);

  async function handleCancel(id: string) {
    setCancelling(id);
    try {
      await appointments.updateStatus(id, "cancelled");
      setUpcomingAppointments((prev) => prev.filter((apt) => apt.id !== id));
    } catch (err) {
      console.error("Failed to cancel appointment:", err);
    } finally {
      setCancelling(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/patient">Dashboard</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>Appointments</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div>
        <h1 className="text-2xl font-bold tracking-tight section-header">My Appointments</h1>
        <p className="text-muted-foreground">View and manage your appointments</p>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming" className="cursor-pointer">
            Upcoming ({upcomingAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="cursor-pointer">
            Past ({pastAppointments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          <div className="space-y-4 mt-4">
            {upcomingAppointments.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <CalendarDays className="h-12 w-12 text-muted-foreground/50 mb-3" />
                  <p className="font-medium">No upcoming appointments</p>
                  <p className="text-sm text-muted-foreground">
                    Book an appointment to get started
                  </p>
                </CardContent>
              </Card>
            ) : (
              upcomingAppointments.map((apt) => (
                <Card key={apt.id}>
                  <CardContent className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
                          <Stethoscope className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{apt.doctor || apt.doctor_name}</p>
                          <p className="text-sm text-muted-foreground">{apt.clinic || apt.clinic_name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{apt.type || apt.appointment_type || "Consultation"}</Badge>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="cursor-pointer text-muted-foreground hover:text-destructive"
                          disabled={cancelling === apt.id}
                          onClick={() => handleCancel(apt.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {new Date(apt.date || apt.appointment_date).toLocaleDateString("en-IN", {
                          weekday: "short",
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
                    <div className="flex justify-end">
                      <Button
                        variant="destructive"
                        size="sm"
                        className="cursor-pointer"
                        disabled={cancelling === apt.id}
                        onClick={() => handleCancel(apt.id)}
                      >
                        <X className="h-3.5 w-3.5 mr-1" />
                        {cancelling === apt.id ? "Cancelling..." : "Cancel Appointment"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="past">
          <div className="space-y-4 mt-4">
            {pastAppointments.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <CalendarDays className="h-12 w-12 text-muted-foreground/50 mb-3" />
                  <p className="font-medium">No past appointments</p>
                  <p className="text-sm text-muted-foreground">
                    Your appointment history will appear here
                  </p>
                </CardContent>
              </Card>
            ) : (
              pastAppointments.map((apt) => (
                <Card key={apt.id}>
                  <CardContent className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted">
                          <Stethoscope className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{apt.doctor || apt.doctor_name}</p>
                          <p className="text-sm text-muted-foreground">{apt.clinic || apt.clinic_name}</p>
                        </div>
                      </div>
                      <Badge variant="outline">{apt.type || apt.appointment_type || "Consultation"}</Badge>
                    </div>
                    <Separator />
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {new Date(apt.date || apt.appointment_date).toLocaleDateString("en-IN", {
                          weekday: "short",
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
                    {apt.notes && (
                      <div className="flex items-start gap-2 bg-muted/50 rounded-lg p-3">
                        <FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-0.5">
                            Doctor&apos;s Notes
                          </p>
                          <p className="text-sm">{apt.notes}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
    </div>
  );
}
