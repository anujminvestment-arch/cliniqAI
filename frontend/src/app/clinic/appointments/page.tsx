"use client";

import { useState, useEffect } from "react";
import {
  CalendarDays,
  Plus,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
import { appointments as appointmentsApi, doctors as doctorsApi } from "@/lib/api";
import { Spinner } from "@/components/shared/spinner";
import { Pagination } from "@/components/shared/pagination";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";

const statusColors: Record<string, string> = {
  confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  "in-progress": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  waiting: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

function formatStatus(status: string): string {
  if (status === "in-progress") return "In Progress";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

type FilterTab = "all" | "confirmed" | "in-progress" | "waiting" | "cancelled";

export default function AppointmentsPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formPatient, setFormPatient] = useState("");
  const [formDoctor, setFormDoctor] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formTime, setFormTime] = useState("");
  const [formType, setFormType] = useState("");

  const [appointmentsList, setAppointmentsList] = useState<any[]>([]);
  const [doctorsList, setDoctorsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const PAGE_SIZE = 20;
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingApt, setEditingApt] = useState<any>(null);
  const [editPatient, setEditPatient] = useState("");
  const [editDoctor, setEditDoctor] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editType, setEditType] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const [aptsRes, docsRes] = await Promise.all([
          appointmentsApi.list({ limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE }),
          doctorsApi.list(),
        ]);
        setAppointmentsList(aptsRes.appointments || []);
        setTotal(aptsRes.total || aptsRes.appointments?.length || 0);
        setDoctorsList(docsRes.doctors || []);
      } catch (err: any) {
        setError(err.message || "Failed to load appointments");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [page]);

  const filtered =
    activeTab === "all"
      ? appointmentsList
      : appointmentsList.filter((a) => a.status === activeTab);

  async function handleCreate() {
    try {
      await appointmentsApi.create({
        patient_name: formPatient,
        doctor_name: formDoctor,
        appointment_date: formDate,
        time_slot: formTime,
        type: formType,
      });
      const res = await appointmentsApi.list();
      setAppointmentsList(res.appointments || []);
    } catch (err: any) {
      setError(err.message || "Failed to create appointment");
    }
    setDialogOpen(false);
    setFormPatient("");
    setFormDoctor("");
    setFormDate("");
    setFormTime("");
    setFormType("");
  }

  function openEditDialog(apt: any) {
    setEditingApt(apt);
    setEditPatient(apt.patient_name || apt.patient || "");
    setEditDoctor(apt.doctor_name || apt.doctor || "");
    setEditDate(apt.appointment_date || "");
    setEditTime(apt.time_slot || apt.time || "");
    setEditType(apt.type || "");
    setEditDialogOpen(true);
  }

  async function handleEdit() {
    if (!editingApt) return;
    try {
      await appointmentsApi.update(editingApt.id, {
        patient_name: editPatient,
        doctor_name: editDoctor,
        appointment_date: editDate,
        time_slot: editTime,
        type: editType,
      });
      const res = await appointmentsApi.list();
      setAppointmentsList(res.appointments || []);
    } catch (err: any) {
      setError(err.message || "Failed to update appointment");
    }
    setEditDialogOpen(false);
    setEditingApt(null);
  }

  async function handleCancel(apt: any) {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      await appointmentsApi.updateStatus(apt.id, "cancelled");
      const res = await appointmentsApi.list();
      setAppointmentsList(res.appointments || []);
    } catch (err: any) {
      setError(err.message || "Failed to cancel appointment");
    }
  }

  function handleView(apt: any) {
    alert(`Appointment Details:\n\nPatient: ${apt.patient_name || apt.patient}\nDoctor: ${apt.doctor_name || apt.doctor}\nTime: ${apt.time_slot || apt.time}\nType: ${apt.type}\nStatus: ${apt.status}`);
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
          <BreadcrumbItem><BreadcrumbPage>Appointments</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight section-header">Appointments</h1>
          <p className="text-muted-foreground">Manage patient appointments and scheduling</p>
        </div>
        <div className="flex items-center gap-3">
          <Input type="date" defaultValue="2026-03-12" className="w-auto" />
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger
              render={
                <Button className="cursor-pointer">
                  <Plus className="h-4 w-4 mr-1.5" />
                  New Appointment
                </Button>
              }
            />
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>New Appointment</DialogTitle>
                <DialogDescription>Schedule a new patient appointment.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-2">
                <div className="grid gap-2">
                  <Label htmlFor="patient-name">Patient Name</Label>
                  <Input
                    id="patient-name"
                    placeholder="Enter patient name"
                    value={formPatient}
                    onChange={(e) => setFormPatient(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="doctor-select">Doctor</Label>
                  <Select value={formDoctor} onValueChange={(v) => setFormDoctor(v ?? "")}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctorsList.map((doc) => (
                        <SelectItem key={doc.id} value={doc.name}>
                          {doc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="apt-date">Date</Label>
                    <Input
                      id="apt-date"
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="apt-time">Time Slot</Label>
                    <Select value={formTime} onValueChange={(v) => setFormTime(v ?? "")}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        {["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM"].map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="apt-type">Type</Label>
                  <Select value={formType} onValueChange={(v) => setFormType(v ?? "")}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {["Checkup", "Consultation", "Follow-up", "Cleaning", "Root Canal", "Extraction"].map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" className="cursor-pointer" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button className="cursor-pointer" onClick={handleCreate}>
                  Schedule Appointment
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <Tabs defaultValue="all" onValueChange={(v) => setActiveTab(v as FilterTab)}>
            <TabsList>
              <TabsTrigger value="all" className="cursor-pointer">All</TabsTrigger>
              <TabsTrigger value="confirmed" className="cursor-pointer">Confirmed</TabsTrigger>
              <TabsTrigger value="in-progress" className="cursor-pointer">In Progress</TabsTrigger>
              <TabsTrigger value="waiting" className="cursor-pointer">Waiting</TabsTrigger>
              <TabsTrigger value="cancelled" className="cursor-pointer">Cancelled</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <Table className="table-enhanced">
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[60px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((apt) => (
                <TableRow key={apt.id}>
                  <TableCell className="font-medium">{apt.patient_name || apt.patient}</TableCell>
                  <TableCell>{apt.doctor_name || apt.doctor}</TableCell>
                  <TableCell>{apt.time_slot || apt.time}</TableCell>
                  <TableCell>{apt.type}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={statusColors[apt.status]}>
                      {formatStatus(apt.status)}
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
                        <DropdownMenuItem className="cursor-pointer" onClick={() => handleView(apt)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer" onClick={() => openEditDialog(apt)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer" variant="destructive" onClick={() => handleCancel(apt)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Cancel
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No appointments found for this filter.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
        </CardContent>
      </Card>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Appointment</DialogTitle>
            <DialogDescription>Update appointment details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="edit-patient">Patient Name</Label>
              <Input id="edit-patient" value={editPatient} onChange={(e) => setEditPatient(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-doctor">Doctor</Label>
              <Select value={editDoctor} onValueChange={(v) => setEditDoctor(v ?? "")}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select doctor" /></SelectTrigger>
                <SelectContent>
                  {doctorsList.map((doc) => (
                    <SelectItem key={doc.id} value={doc.name}>{doc.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Date</Label>
                <Input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>Time Slot</Label>
                <Select value={editTime} onValueChange={(v) => setEditTime(v ?? "")}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Select time" /></SelectTrigger>
                  <SelectContent>
                    {["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM"].map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Type</Label>
              <Select value={editType} onValueChange={(v) => setEditType(v ?? "")}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {["Checkup", "Consultation", "Follow-up", "Cleaning", "Root Canal", "Extraction"].map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="cursor-pointer" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button className="cursor-pointer" onClick={handleEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
