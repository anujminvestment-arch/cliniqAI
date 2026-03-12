"use client";

import {
  Users,
  Stethoscope,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { doctorsList, staffList } from "@/lib/mock-data";

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
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Doctors & Staff</h1>
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
                        {doctor.name.split(" ").slice(1).map((n) => n[0]).join("")}
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
                            <span className="font-medium">{doctor.patients}</span>
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
          </div>
        </TabsContent>

        <TabsContent value="staff">
          <Card className="mt-4">
            <CardContent className="pt-6">
              <Table>
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
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
