"use client";

import {
  CalendarDays,
  Clock,
  MapPin,
  Stethoscope,
  FileText,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { patientPortal } from "@/lib/mock-data";

export default function MedicalRecordsPage() {
  const { pastAppointments } = patientPortal;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Medical Records</h1>
        <p className="text-muted-foreground">
          Timeline of your past visits and consultations
        </p>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[23px] top-0 bottom-0 w-0.5 bg-border" />

        <div className="space-y-6">
          {pastAppointments.map((visit, index) => {
            const visitDate = new Date(visit.date);
            const formattedDate = visitDate.toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });
            const weekday = visitDate.toLocaleDateString("en-IN", {
              weekday: "long",
            });

            return (
              <div key={visit.id} className="relative flex gap-4">
                {/* Timeline dot */}
                <div className="relative z-10 flex shrink-0">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full ${
                      index === 0
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Stethoscope className="h-5 w-5" />
                  </div>
                </div>

                {/* Content */}
                <Card className="flex-1">
                  <CardContent className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{visit.doctor}</p>
                        <p className="text-sm text-muted-foreground">{visit.clinic}</p>
                      </div>
                      <Badge variant={index === 0 ? "default" : "outline"}>
                        {visit.type}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {weekday}, {formattedDate}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {visit.time}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        {visit.clinic}
                      </span>
                    </div>

                    {visit.notes && (
                      <>
                        <Separator />
                        <div className="flex items-start gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-0.5">
                              Notes
                            </p>
                            <p className="text-sm">{visit.notes}</p>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      {pastAppointments.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="font-medium">No medical records</p>
            <p className="text-sm text-muted-foreground">
              Your visit history will appear here after your first appointment
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
