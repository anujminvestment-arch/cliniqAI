"use client";

import { useState } from "react";
import {
  Building2,
  Plus,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { clinicsList } from "@/lib/mock-data";

const statusColor: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  suspended: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

type ClinicStatus = "all" | "active" | "pending" | "suspended";

function ClinicsTable({ clinics }: { clinics: typeof clinicsList }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>City</TableHead>
          <TableHead>Plan</TableHead>
          <TableHead className="text-right">Doctors</TableHead>
          <TableHead className="text-right">Patients</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clinics.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
              No clinics found
            </TableCell>
          </TableRow>
        ) : (
          clinics.map((clinic) => (
            <TableRow key={clinic.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <span className="font-medium">{clinic.name}</span>
                </div>
              </TableCell>
              <TableCell>{clinic.city}</TableCell>
              <TableCell>{clinic.plan}</TableCell>
              <TableCell className="text-right">{clinic.doctors}</TableCell>
              <TableCell className="text-right">{clinic.patients.toLocaleString()}</TableCell>
              <TableCell>
                <Badge variant="outline" className={statusColor[clinic.status]}>
                  {clinic.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button variant="ghost" size="icon" className="cursor-pointer" />
                    }
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="cursor-pointer">
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit Clinic
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" className="cursor-pointer">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Suspend Clinic
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}

export default function ClinicsPage() {
  const [activeTab, setActiveTab] = useState<ClinicStatus>("all");

  const filteredClinics =
    activeTab === "all"
      ? clinicsList
      : clinicsList.filter((c) => c.status === activeTab);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manage Clinics</h1>
          <p className="text-muted-foreground">
            View and manage all registered clinics
          </p>
        </div>
        <Button className="cursor-pointer">
          <Plus className="mr-2 h-4 w-4" />
          Add Clinic
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ClinicStatus)}>
            <TabsList className="mb-4">
              <TabsTrigger value="all" className="cursor-pointer">
                All ({clinicsList.length})
              </TabsTrigger>
              <TabsTrigger value="active" className="cursor-pointer">
                Active ({clinicsList.filter((c) => c.status === "active").length})
              </TabsTrigger>
              <TabsTrigger value="pending" className="cursor-pointer">
                Pending ({clinicsList.filter((c) => c.status === "pending").length})
              </TabsTrigger>
              <TabsTrigger value="suspended" className="cursor-pointer">
                Suspended ({clinicsList.filter((c) => c.status === "suspended").length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              <ClinicsTable clinics={filteredClinics} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
