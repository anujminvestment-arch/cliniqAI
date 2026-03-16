"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
import { patients as patientsApi } from "@/lib/api";
import { Spinner } from "@/components/shared/spinner";
import { Pagination } from "@/components/shared/pagination";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";

export default function PatientsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<any>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAge, setEditAge] = useState("");
  const [editGender, setEditGender] = useState("");
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formAge, setFormAge] = useState("");
  const [formGender, setFormGender] = useState("");

  const [patientsList, setPatientsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const PAGE_SIZE = 20;

  async function fetchPatients() {
    try {
      setLoading(true);
      setError(null);
      const res = await patientsApi.list({ search: search || undefined, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE });
      setPatientsList(res.patients || []);
      setTotal(res.total || res.patients?.length || 0);
    } catch (err: any) {
      setError(err.message || "Failed to load patients");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPatients();
  }, [page]);

  const filtered = patientsList.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.phone || "").includes(search)
  );

  async function handleRegister() {
    try {
      await patientsApi.create({
        name: formName,
        phone: formPhone,
        age: formAge ? Number(formAge) : undefined,
        gender: formGender,
      });
      await fetchPatients();
    } catch (err: any) {
      setError(err.message || "Failed to register patient");
    }
    setDialogOpen(false);
    setFormName("");
    setFormPhone("");
    setFormAge("");
    setFormGender("");
  }

  function openEditDialog(patient: any) {
    setEditingPatient(patient);
    setEditName(patient.name || "");
    setEditPhone(patient.phone || "");
    setEditAge(String(patient.age || ""));
    setEditGender(patient.gender || "");
    setEditDialogOpen(true);
  }

  async function handleEdit() {
    if (!editingPatient) return;
    try {
      await patientsApi.update(editingPatient.id, {
        name: editName,
        phone: editPhone,
        age: editAge ? Number(editAge) : undefined,
        gender: editGender,
      });
      await fetchPatients();
    } catch (err: any) {
      setError(err.message || "Failed to update patient");
    }
    setEditDialogOpen(false);
    setEditingPatient(null);
  }

  async function handleDelete(patient: any) {
    if (!window.confirm("Are you sure you want to delete this patient?")) return;
    try {
      await patientsApi.update(patient.id, { is_active: false });
      await fetchPatients();
    } catch (err: any) {
      setError(err.message || "Failed to delete patient");
    }
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
        <Button variant="outline" onClick={() => fetchPatients()}>
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
          <BreadcrumbItem><BreadcrumbPage>Patients</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight section-header">Patients</h1>
          <p className="text-muted-foreground">Manage patient records and registrations</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button className="cursor-pointer w-fit">
                <Plus className="h-4 w-4 mr-1.5" />
                Register Patient
              </Button>
            }
          />
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Register Patient</DialogTitle>
              <DialogDescription>Add a new patient to the clinic system.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="reg-name">Full Name</Label>
                <Input
                  id="reg-name"
                  placeholder="Enter patient name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="reg-phone">Phone Number</Label>
                <Input
                  id="reg-phone"
                  placeholder="+91 XXXXX XXXXX"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="reg-age">Age</Label>
                  <Input
                    id="reg-age"
                    type="number"
                    placeholder="Age"
                    value={formAge}
                    onChange={(e) => setFormAge(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="reg-gender">Gender</Label>
                  <Select value={formGender} onValueChange={(v) => setFormGender(v ?? "")}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" className="cursor-pointer" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button className="cursor-pointer" onClick={handleRegister}>
                Register
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="pt-6">
          <div className="mb-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or phone..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <Table className="table-enhanced">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Last Visit</TableHead>
                <TableHead>Total Visits</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead className="w-[60px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">{patient.name}</TableCell>
                  <TableCell>{patient.phone}</TableCell>
                  <TableCell>{patient.age}</TableCell>
                  <TableCell>{patient.gender}</TableCell>
                  <TableCell>{patient.last_visit || patient.lastVisit}</TableCell>
                  <TableCell>{patient.visits || patient.total_visits || 0}</TableCell>
                  <TableCell>
                    <span className={(patient.balance || 0) > 0 ? "text-red-600 dark:text-red-400 font-medium" : ""}>
                      {(patient.balance || 0) > 0
                        ? `₹${(patient.balance || 0).toLocaleString("en-IN")}`
                        : "₹0"}
                    </span>
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
                        <DropdownMenuItem className="cursor-pointer" onClick={() => router.push(`/clinic/patients/${patient.id}`)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Records
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer" onClick={() => openEditDialog(patient)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer" variant="destructive" onClick={() => handleDelete(patient)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    No patients found.
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
            <DialogTitle>Edit Patient</DialogTitle>
            <DialogDescription>Update patient information.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input id="edit-name" value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-phone">Phone Number</Label>
              <Input id="edit-phone" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="edit-age">Age</Label>
                <Input id="edit-age" type="number" value={editAge} onChange={(e) => setEditAge(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-gender">Gender</Label>
                <Select value={editGender} onValueChange={(v) => setEditGender(v ?? "")}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
