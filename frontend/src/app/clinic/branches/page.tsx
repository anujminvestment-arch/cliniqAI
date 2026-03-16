"use client";

import { useState, useEffect } from "react";
import {
  MapPin,
  Plus,
  Stethoscope,
  Clock,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Spinner } from "@/components/shared/spinner";
import { clinics as clinicsApi } from "@/lib/api";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";

export default function BranchesPage() {
  const [branchesList, setBranchesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formTiming, setFormTiming] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<any>(null);
  const [editName, setEditName] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editTiming, setEditTiming] = useState("");

  useEffect(() => {
    clinicsApi.listBranches()
      .then((data) => setBranchesList(data.branches))
      .catch(() => setBranchesList([]))
      .finally(() => setLoading(false));
  }, []);

  function handleCreate() {
    clinicsApi.createBranch({ name: formName, address: formAddress, timing: formTiming })
      .then(() => {
        return clinicsApi.listBranches();
      })
      .then((data) => setBranchesList(data.branches))
      .catch(() => {})
      .finally(() => {
        setDialogOpen(false);
        setFormName("");
        setFormAddress("");
        setFormTiming("");
      });
  }

  function openEditDialog(branch: any) {
    setEditingBranch(branch);
    setEditName(branch.name || "");
    setEditAddress(branch.address || "");
    setEditTiming(branch.timing || "");
    setEditDialogOpen(true);
  }

  function handleEditBranch() {
    if (!editingBranch) return;
    clinicsApi.updateBranch(editingBranch.id, { name: editName, address: editAddress, timing: editTiming })
      .then(() => clinicsApi.listBranches())
      .then((data) => setBranchesList(data.branches))
      .catch(() => {})
      .finally(() => { setEditDialogOpen(false); setEditingBranch(null); });
  }

  function handleDeleteBranch() {
    if (!window.confirm("Are you sure you want to delete this branch?")) return;
    alert("Branch deletion is not supported. Please contact support to remove a branch.");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/clinic">Dashboard</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>Branches</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight section-header">Branches</h1>
          <p className="text-muted-foreground">Manage clinic branches and locations</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button className="cursor-pointer w-fit">
                <Plus className="h-4 w-4 mr-1.5" />
                Add Branch
              </Button>
            }
          />
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Branch</DialogTitle>
              <DialogDescription>Add a new clinic branch location.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="branch-name">Branch Name</Label>
                <Input
                  id="branch-name"
                  placeholder="e.g. SmileCare Powai"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="branch-address">Address</Label>
                <Input
                  id="branch-address"
                  placeholder="Full address"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="branch-timing">Timing</Label>
                <Input
                  id="branch-timing"
                  placeholder="e.g. 9AM - 8PM"
                  value={formTiming}
                  onChange={(e) => setFormTiming(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" className="cursor-pointer" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button className="cursor-pointer" onClick={handleCreate}>
                Add Branch
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {branchesList.map((branch) => {
          const isOpen = branch.status === "open";
          return (
            <Card key={branch.id} className="relative transition-all hover:shadow-md">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{branch.name}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            isOpen ? "bg-green-500" : "bg-red-500"
                          }`}
                        />
                        <span className="text-xs text-muted-foreground">
                          {isOpen ? "Open" : "Closed"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button variant="ghost" size="icon-sm" className="cursor-pointer" />
                      }
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="cursor-pointer" onClick={() => openEditDialog(branch)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer" variant="destructive" onClick={handleDeleteBranch}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <p className="text-xs text-muted-foreground mb-4">{branch.address}</p>

                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-2 text-xs">
                    <Stethoscope className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>
                      <span className="font-medium">{branch.doctors}</span>{" "}
                      <span className="text-muted-foreground">Doctors</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">{branch.timing}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Branch</DialogTitle>
            <DialogDescription>Update branch details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="edit-branch-name">Branch Name</Label>
              <Input id="edit-branch-name" value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-branch-address">Address</Label>
              <Input id="edit-branch-address" value={editAddress} onChange={(e) => setEditAddress(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-branch-timing">Timing</Label>
              <Input id="edit-branch-timing" value={editTiming} onChange={(e) => setEditTiming(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="cursor-pointer" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button className="cursor-pointer" onClick={handleEditBranch}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
