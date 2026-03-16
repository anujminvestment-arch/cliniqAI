"use client";

import { useState, useEffect } from "react";
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
import { Spinner } from "@/components/shared/spinner";
import { Pagination } from "@/components/shared/pagination";
import { admin } from "@/lib/api";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";

const statusColor: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  suspended: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

type ClinicStatus = "all" | "active" | "pending" | "suspended";

function ClinicsTable({ clinics }: { clinics: any[] }) {
  return (
    <Table className="table-enhanced">
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
          clinics.map((clinic: any) => (
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
              <TableCell className="text-right">{(clinic.patients ?? 0).toLocaleString()}</TableCell>
              <TableCell>
                <Badge variant="outline" className={statusColor[clinic.status] || ""}>
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
                    <DropdownMenuItem className="cursor-pointer" onClick={() => alert(`Clinic Details:\n\nName: ${clinic.name}\nCity: ${clinic.city}\nPlan: ${clinic.plan}\nDoctors: ${clinic.doctors}\nPatients: ${clinic.patients ?? 0}\nStatus: ${clinic.status}`)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit Clinic
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" className="cursor-pointer" onClick={() => { if (!window.confirm("Are you sure you want to suspend this clinic?")) return; alert(`Clinic "${clinic.name}" has been suspended.`); }}>
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
  const [clinicsList, setClinicsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const PAGE_SIZE = 20;

  useEffect(() => {
    async function fetchClinics() {
      try {
        const data = await admin.listClinics({ limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE });
        setClinicsList((data as any).clinics || []);
        setTotal((data as any).total || (data as any).clinics?.length || 0);
      } catch (err) {
        console.error("Failed to load clinics:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchClinics();
  }, [page]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  const filteredClinics =
    activeTab === "all"
      ? clinicsList
      : clinicsList.filter((c: any) => c.status === activeTab);

  return (
    <div className="space-y-6">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>Clinics</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight section-header">Manage Clinics</h1>
          <p className="text-muted-foreground">
            View and manage all registered clinics
          </p>
        </div>
        <Button className="cursor-pointer">
          <Plus className="mr-2 h-4 w-4" />
          Add Clinic
        </Button>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ClinicStatus)}>
            <TabsList className="mb-4">
              <TabsTrigger value="all" className="cursor-pointer">
                All ({clinicsList.length})
              </TabsTrigger>
              <TabsTrigger value="active" className="cursor-pointer">
                Active ({clinicsList.filter((c: any) => c.status === "active").length})
              </TabsTrigger>
              <TabsTrigger value="pending" className="cursor-pointer">
                Pending ({clinicsList.filter((c: any) => c.status === "pending").length})
              </TabsTrigger>
              <TabsTrigger value="suspended" className="cursor-pointer">
                Suspended ({clinicsList.filter((c: any) => c.status === "suspended").length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              <ClinicsTable clinics={filteredClinics} />
            </TabsContent>
          </Tabs>
          <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
        </CardContent>
      </Card>
    </div>
  );
}
