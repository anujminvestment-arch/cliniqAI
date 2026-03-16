"use client";

import { useState, useEffect } from "react";
import {
  Pill,
  Stethoscope,
  CalendarDays,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/shared/spinner";
import { prescriptions as prescriptionsApi } from "@/lib/api";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";

export default function PrescriptionsPage() {
  const [loading, setLoading] = useState(true);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await prescriptionsApi.list();
        setPrescriptions(res.prescriptions || []);
      } catch (err) {
        console.error("Failed to load prescriptions:", err);
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
    <div className="space-y-6">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/patient">Dashboard</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>Prescriptions</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div>
        <h1 className="text-2xl font-bold tracking-tight section-header">Prescriptions</h1>
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
            const prescriptionDate = new Date(rx.date || rx.created_at);
            const formattedDate = prescriptionDate.toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            });
            const medicines = rx.medicines || rx.items || [];

            return (
              <Card key={rx.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
                        <Stethoscope className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{rx.doctor || rx.doctor_name}</CardTitle>
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
                  {medicines.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                        <Pill className="h-3.5 w-3.5" />
                        Medicines
                      </p>
                      <ul className="space-y-2">
                        {medicines.map((medicine: any, idx: number) => (
                          <li
                            key={idx}
                            className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2"
                          >
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                              {idx + 1}
                            </span>
                            <span className="text-sm">
                              {typeof medicine === "string" ? medicine : medicine.name}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

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
