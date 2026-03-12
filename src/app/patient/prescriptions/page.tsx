"use client";

import {
  Pill,
  Stethoscope,
  CalendarDays,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { patientPortal } from "@/lib/mock-data";

export default function PrescriptionsPage() {
  const { prescriptions } = patientPortal;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Prescriptions</h1>
        <p className="text-muted-foreground">
          View your prescribed medications and instructions
        </p>
      </div>

      {prescriptions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Pill className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="font-medium">No prescriptions</p>
            <p className="text-sm text-muted-foreground">
              Prescriptions from your doctors will appear here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {prescriptions.map((rx) => {
            const prescriptionDate = new Date(rx.date);
            const formattedDate = prescriptionDate.toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            });

            return (
              <Card key={rx.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
                        <Stethoscope className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{rx.doctor}</CardTitle>
                        <CardDescription className="flex items-center gap-1.5">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {formattedDate}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary">{rx.id}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                      <Pill className="h-3.5 w-3.5" />
                      Medicines
                    </p>
                    <ul className="space-y-2">
                      {rx.medicines.map((medicine, idx) => (
                        <li
                          key={idx}
                          className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2"
                        >
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                            {idx + 1}
                          </span>
                          <span className="text-sm">{medicine}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {rx.notes && (
                    <>
                      <Separator />
                      <div className="flex items-start gap-2 rounded-lg bg-muted/30 p-3">
                        <FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-0.5">
                            Instructions
                          </p>
                          <p className="text-sm">{rx.notes}</p>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
