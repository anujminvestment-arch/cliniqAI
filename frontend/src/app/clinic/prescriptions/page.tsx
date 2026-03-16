"use client";

import { useState, useEffect } from "react";
import {
  Pill,
  Plus,
  Search,
  Share2,
  Eye,
  MoreHorizontal,
  FileText,
  Clock,
  CheckCircle2,
  Send,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatCard } from "@/components/shared/stat-card";
import { prescriptions as prescriptionsApi, patients as patientsApi } from "@/lib/api";
import { Spinner } from "@/components/shared/spinner";
import { Pagination } from "@/components/shared/pagination";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";

const statusColors: Record<string, string> = {
  sent: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  viewed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
};

const statusIcons: Record<string, React.ElementType> = {
  sent: Send,
  pending: Clock,
  viewed: CheckCircle2,
};

export default function PrescriptionsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [rxPatient, setRxPatient] = useState("");
  const [rxMed1Name, setRxMed1Name] = useState("");
  const [rxMed1Dosage, setRxMed1Dosage] = useState("");
  const [rxMed1Freq, setRxMed1Freq] = useState("");
  const [rxMed2Name, setRxMed2Name] = useState("");
  const [rxMed2Dosage, setRxMed2Dosage] = useState("");
  const [rxMed2Freq, setRxMed2Freq] = useState("");
  const [rxNotes, setRxNotes] = useState("");

  const [clinicPrescriptions, setClinicPrescriptions] = useState<any[]>([]);
  const [patientsList, setPatientsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const PAGE_SIZE = 20;

  async function fetchData() {
    try {
      setLoading(true);
      setError(null);
      const [rxRes, patientsRes] = await Promise.all([
        prescriptionsApi.list({ limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE }),
        patientsApi.list(),
      ]);
      setClinicPrescriptions(rxRes.prescriptions || []);
      setTotal(rxRes.total || rxRes.prescriptions?.length || 0);
      setPatientsList(patientsRes.patients || []);
    } catch (err: any) {
      setError(err.message || "Failed to load prescriptions");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [page]);

  async function handleCreatePrescription() {
    const medications: any[] = [];
    if (rxMed1Name) medications.push({ name: rxMed1Name, dosage: rxMed1Dosage, frequency: rxMed1Freq });
    if (rxMed2Name) medications.push({ name: rxMed2Name, dosage: rxMed2Dosage, frequency: rxMed2Freq });
    try {
      await prescriptionsApi.create({
        patient_id: rxPatient,
        medications,
        notes: rxNotes,
      });
      await fetchData();
    } catch (err: any) {
      setError(err.message || "Failed to create prescription");
    }
    setDialogOpen(false);
    setRxPatient(""); setRxMed1Name(""); setRxMed1Dosage(""); setRxMed1Freq("");
    setRxMed2Name(""); setRxMed2Dosage(""); setRxMed2Freq(""); setRxNotes("");
  }

  async function handleShare(rx: any) {
    try {
      await prescriptionsApi.sign(rx.id);
      await fetchData();
      alert("Prescription signed and shared with patient.");
    } catch (err: any) {
      alert(err.message || "Failed to share prescription");
    }
  }

  function handleView(rx: any) {
    const meds = (rx.medications || []).map((m: any) => typeof m === "string" ? m : `${m.name} (${m.dosage}, ${m.frequency})`).join(", ");
    alert(`Prescription Details:\n\nID: ${rx.id}\nPatient: ${rx.patient_name || rx.patient}\nDoctor: ${rx.doctor_name || rx.doctor}\nDate: ${rx.date}\nMedications: ${meds}\nStatus: ${rx.status}`);
  }

  function handleDownloadPDF(rx: any) {
    window.open(`/api/prescriptions/${rx.id}/pdf`, "_blank");
  }

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
        <Button variant="outline" onClick={() => fetchData()}>
          Retry
        </Button>
      </div>
    );
  }

  const filtered = clinicPrescriptions.filter((rx) => {
    const patientName = rx.patient_name || rx.patient || "";
    const meds = rx.medications || [];
    const matchesSearch =
      patientName.toLowerCase().includes(search.toLowerCase()) ||
      meds.some((m: any) => {
        const medName = typeof m === "string" ? m : m.name || "";
        return medName.toLowerCase().includes(search.toLowerCase());
      });
    const matchesStatus = statusFilter === "all" || rx.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPrescriptions = clinicPrescriptions.length;
  const pendingCount = clinicPrescriptions.filter((r) => r.status === "pending").length;
  const sentCount = clinicPrescriptions.filter((r) => r.status === "sent").length;

  return (
    <div className="space-y-6">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/clinic">Dashboard</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>Prescriptions</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight section-header">Prescriptions</h1>
          <p className="text-muted-foreground">Manage and share patient prescriptions</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button className="cursor-pointer w-fit">
                <Plus className="h-4 w-4 mr-1.5" />
                New Prescription
              </Button>
            }
          />
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Prescription</DialogTitle>
              <DialogDescription>Write a new prescription for a patient.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label>Patient</Label>
                <Select value={rxPatient} onValueChange={(v) => setRxPatient(v ?? "")}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patientsList.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Medication 1</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Input placeholder="Medicine name" value={rxMed1Name} onChange={(e) => setRxMed1Name(e.target.value)} />
                  <Input placeholder="Dosage" value={rxMed1Dosage} onChange={(e) => setRxMed1Dosage(e.target.value)} />
                  <Input placeholder="Frequency" value={rxMed1Freq} onChange={(e) => setRxMed1Freq(e.target.value)} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Medication 2 (optional)</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Input placeholder="Medicine name" value={rxMed2Name} onChange={(e) => setRxMed2Name(e.target.value)} />
                  <Input placeholder="Dosage" value={rxMed2Dosage} onChange={(e) => setRxMed2Dosage(e.target.value)} />
                  <Input placeholder="Frequency" value={rxMed2Freq} onChange={(e) => setRxMed2Freq(e.target.value)} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Notes / Instructions</Label>
                <Textarea placeholder="Special instructions for the patient..." value={rxNotes} onChange={(e) => setRxNotes(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" className="cursor-pointer" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button className="cursor-pointer" onClick={handleCreatePrescription}>
                Create & Send
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Total Prescriptions" value={totalPrescriptions} icon={Pill} color="primary" />
        <StatCard title="Pending" value={pendingCount} icon={Clock} color="amber" description="Awaiting delivery" />
        <StatCard title="Sent to Patients" value={sentCount} icon={Send} color="accent" />
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base">All Prescriptions</CardTitle>
            <div className="flex gap-2">
              <div className="relative max-w-xs">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search patient or medicine..."
                  className="pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="viewed">Viewed</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table className="table-enhanced">
            <TableHeader>
              <TableRow>
                <TableHead>Rx ID</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Medications</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[60px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((rx) => {
                const StatusIcon = statusIcons[rx.status] || Clock;
                const meds = rx.medications || [];
                return (
                  <TableRow key={rx.id}>
                    <TableCell className="font-mono text-xs font-medium">{rx.id}</TableCell>
                    <TableCell className="font-medium">{rx.patient_name || rx.patient}</TableCell>
                    <TableCell className="text-muted-foreground">{rx.doctor_name || rx.doctor}</TableCell>
                    <TableCell className="text-muted-foreground">{rx.date}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {meds.map((m: any, i: number) => (
                          <Badge key={i} variant="secondary" className="text-[10px]">
                            {typeof m === "string" ? m : m.name}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={statusColors[rx.status]}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {(rx.status || "").charAt(0).toUpperCase() + (rx.status || "").slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" size="icon-sm" className="cursor-pointer" />
                          }
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="cursor-pointer" onClick={() => handleView(rx)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer" onClick={() => handleShare(rx)}>
                            <Share2 className="mr-2 h-4 w-4" />
                            Share with Patient
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer" onClick={() => handleDownloadPDF(rx)}>
                            <FileText className="mr-2 h-4 w-4" />
                            Download PDF
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No prescriptions found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
        </CardContent>
      </Card>
    </div>
  );
}
