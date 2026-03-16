"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Stethoscope,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { doctors as doctorsApi, staff as staffApi } from "@/lib/api";
import { Spinner } from "@/components/shared/spinner";
import { Pagination } from "@/components/shared/pagination";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";

const doctorStatusConfig: Record<string, { label: string; dotClass: string }> = {
  available: {
    label: "Available",
    dotClass: "bg-green-500",
  },
  "in-consultation": {
    label: "In Consultation",
    dotClass: "bg-amber-500",
  },
  "off-duty": {
    label: "Off Duty",
    dotClass: "bg-gray-400",
  },
};

const staffStatusConfig: Record<string, { label: string; className: string }> = {
  active: {
    label: "Active",
    className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  "on-leave": {
    label: "On Leave",
    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  inactive: {
    label: "Inactive",
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
};

export default function StaffPage() {
  const [doctorsList, setDoctorsList] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const PAGE_SIZE = 20;

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const [docsRes, staffRes] = await Promise.all([
          doctorsApi.list(),
          staffApi.list({ limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE }),
        ]);
        setDoctorsList(docsRes.doctors || []);
        setStaffList(staffRes.staff || []);
        setTotal(staffRes.total || staffRes.staff?.length || 0);
      } catch (err: any) {
        setError(err.message || "Failed to load staff data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [page]);

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
        <Button variant="outline" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/clinic">Dashboard</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>Staff</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div>
        <h1 className="text-2xl font-bold tracking-tight section-header">Doctors & Staff</h1>
        <p className="text-muted-foreground">Manage clinic doctors and staff members</p>
      </div>

      <Tabs defaultValue="doctors">
        <TabsList>
          <TabsTrigger value="doctors" className="cursor-pointer">
            <Stethoscope className="h-4 w-4 mr-1.5" />
            Doctors
          </TabsTrigger>
          <TabsTrigger value="staff" className="cursor-pointer">
            <Users className="h-4 w-4 mr-1.5" />
            Staff
          </TabsTrigger>
        </TabsList>

        <TabsContent value="doctors">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-4">
            {doctorsList.map((doctor) => {
              const statusCfg = doctorStatusConfig[doctor.status] ?? doctorStatusConfig["off-duty"];
              return (
                <Card key={doctor.id} className="transition-all hover:shadow-md">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold">
                        {(doctor.name || "").split(" ").slice(1).map((n: string) => n[0]).join("")}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-sm truncate">{doctor.name}</h3>
                          <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${statusCfg.dotClass}`} />
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">{doctor.specialization}</p>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Patients</span>
                            <span className="font-medium">{doctor.patients || 0}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{doctor.schedule}</span>
                          </div>
                          <Badge
                            variant="secondary"
                            className={`text-xs ${
                              doctor.status === "available"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : doctor.status === "in-consultation"
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                            }`}
                          >
                            {statusCfg.label}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {doctorsList.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No doctors found.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="staff">
          <Card className="mt-4 overflow-hidden">
            <CardContent className="pt-6">
              <Table className="table-enhanced">
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Shift</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staffList.map((member) => {
                    const statusCfg = staffStatusConfig[member.status] ?? staffStatusConfig["inactive"];
                    return (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">{member.name}</TableCell>
                        <TableCell>{member.role}</TableCell>
                        <TableCell>{member.phone}</TableCell>
                        <TableCell>{member.shift}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={statusCfg.className}>
                            {statusCfg.label}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {staffList.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        No staff members found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
