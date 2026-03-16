"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Building,
  Building2,
  Users,
  IndianRupee,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Clock,
  Plus,
  Pencil,
  Eye,
  MoreHorizontal,
  TrendingUp,
  Star,
  FileText,
  CheckCircle2,
  Ban,
  Stethoscope,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
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
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { StatCard } from "@/components/shared/stat-card";
import { Spinner } from "@/components/shared/spinner";
import { admin } from "@/lib/api";

const statusColors: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  suspended: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  inactive: "bg-gray-100 text-gray-600 dark:bg-gray-800/50 dark:text-gray-400",
};

const planColors: Record<string, string> = {
  Basic: "bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400",
  Professional: "bg-primary/10 text-primary",
  Enterprise: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
};

export default function OrganizationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [org, setOrg] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [addClinicOpen, setAddClinicOpen] = useState(false);

  useEffect(() => {
    async function fetchOrg() {
      try {
        const data = await admin.stats();
        const orgs = (data as any).organizations || [];
        const found = orgs.find((o: any) => o.id === id);
        setOrg(found || null);
      } catch (err) {
        console.error("Failed to load organization:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrg();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!org) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Building className="h-16 w-16 text-muted-foreground/30" />
        <p className="text-xl font-semibold">Organization not found</p>
        <Link href="/admin/organizations">
          <Button variant="outline" className="cursor-pointer">
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Organizations
          </Button>
        </Link>
      </div>
    );
  }

  const initials = (org.name || "").split(" ").slice(0, 2).map((w: string) => w[0]).join("");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/organizations">
          <Button variant="ghost" size="icon" className="cursor-pointer">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight section-header">Organization Details</h1>
          <p className="text-muted-foreground">Manage organization, clinics, and subscription</p>
        </div>
      </div>

      {/* Profile Card */}
      <Card className="animate-fade-in-up">
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <Avatar className="h-16 w-16 text-xl">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold">{org.name}</h2>
                  <p className="text-muted-foreground">Owned by {org.owner}</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary" className={planColors[org.plan] || ""}>
                    {org.plan} Plan
                  </Badge>
                  <Badge variant="secondary" className={statusColors[org.status] || ""}>
                    {(org.status || "").charAt(0).toUpperCase() + (org.status || "").slice(1)}
                  </Badge>
                </div>
              </div>
              <div className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  {org.email}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" />
                  {org.phone}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  {(org.address || "").split(",").slice(-2).join(",").trim()}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  Since {org.registeredDate}
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <FileText className="h-3 w-3" />
                GSTIN: <span className="font-mono">{org.gstin}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Clinics" value={org.totalClinics} icon={Building2} color="primary" delay={0} />
        <StatCard title="Total Doctors" value={org.totalDoctors} icon={Stethoscope} color="accent" delay={75} />
        <StatCard title="Total Patients" value={(org.totalPatients || 0).toLocaleString()} icon={Users} color="emerald" delay={150} />
        <StatCard title="Monthly Revenue" value={(org.monthlyRevenue || 0) > 0 ? `₹${((org.monthlyRevenue || 0) / 1000).toFixed(0)}K` : "\u2014"} icon={IndianRupee} color="violet" delay={225} />
      </div>

      <Tabs defaultValue="clinics">
        <TabsList>
          <TabsTrigger value="clinics" className="cursor-pointer">
            <Building2 className="h-3.5 w-3.5 mr-1.5" />
            Clinics ({(org.clinics || []).length})
          </TabsTrigger>
          <TabsTrigger value="activity" className="cursor-pointer">
            <Clock className="h-3.5 w-3.5 mr-1.5" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="subscription" className="cursor-pointer">
            <IndianRupee className="h-3.5 w-3.5 mr-1.5" />
            Subscription
          </TabsTrigger>
        </TabsList>

        {/* Clinics Tab */}
        <TabsContent value="clinics" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Managed Clinics</h3>
            <Dialog open={addClinicOpen} onOpenChange={setAddClinicOpen}>
              <DialogTrigger
                render={
                  <Button className="cursor-pointer" size="sm">
                    <Plus className="h-4 w-4 mr-1.5" />
                    Add Clinic Branch
                  </Button>
                }
              />
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Add New Clinic Branch</DialogTitle>
                  <DialogDescription>Register a new clinic under {org.name}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-2">
                  <div className="grid gap-2">
                    <Label>Clinic Name</Label>
                    <Input placeholder="e.g. SmileCare Bandra" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Address</Label>
                    <Input placeholder="Full clinic address" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-2">
                      <Label>City</Label>
                      <Input placeholder="City" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Timings</Label>
                      <Input placeholder="e.g. 9AM - 6PM" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-2">
                      <Label>Number of Doctors</Label>
                      <Input type="number" placeholder="0" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Contact Phone</Label>
                      <Input placeholder="+91..." />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" className="cursor-pointer" onClick={() => setAddClinicOpen(false)}>
                    Cancel
                  </Button>
                  <Button className="cursor-pointer" onClick={() => setAddClinicOpen(false)}>
                    Add Clinic
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(org.clinics || []).map((clinic: any, i: number) => (
              <Card
                key={clinic.id}
                className="card-hover animate-fade-in-up"
                style={{ animationDelay: `${i * 75}ms` }}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shrink-0">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">{clinic.name}</h4>
                        <p className="text-xs text-muted-foreground">{clinic.city}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className={`text-[10px] ${statusColors[clinic.status] || ""}`}>
                      {(clinic.status || "").charAt(0).toUpperCase() + (clinic.status || "").slice(1)}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{clinic.address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {clinic.timing}
                    </div>
                  </div>

                  <Separator className="my-3" />

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Stethoscope className="h-3 w-3" />
                        {clinic.doctors}
                      </span>
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {clinic.patients}
                      </span>
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
                        <DropdownMenuItem className="cursor-pointer">
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer" variant="destructive">
                          <Ban className="mr-2 h-4 w-4" />
                          Deactivate
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base section-header">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative pl-6 space-y-6">
                <div className="absolute left-[11px] top-2 bottom-2 w-px bg-border" />
                {(org.activity || []).map((event: any, i: number) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-6 top-1 h-3 w-3 rounded-full border-2 border-primary bg-background" />
                    <div>
                      <p className="text-sm">{event.event}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{event.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscription Tab */}
        <TabsContent value="subscription" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base section-header">Subscription Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Current Plan</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-lg font-bold">{org.plan}</p>
                    <Badge variant="secondary" className={planColors[org.plan] || ""}>{org.plan}</Badge>
                  </div>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Monthly Billing</p>
                  <p className="text-lg font-bold mt-1">
                    {(org.monthlyRevenue || 0) > 0 ? `₹${(org.monthlyRevenue || 0).toLocaleString("en-IN")}` : "Suspended"}
                  </p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Registration Date</p>
                  <p className="text-lg font-bold mt-1">{org.registeredDate}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Account Status</p>
                  <Badge variant="secondary" className={`mt-1 ${statusColors[org.status] || ""}`}>
                    {(org.status || "").charAt(0).toUpperCase() + (org.status || "").slice(1)}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-semibold mb-3">Usage Summary</p>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Clinics</span>
                      <span className="font-medium">{org.totalClinics} / {org.plan === "Enterprise" ? "Unlimited" : org.plan === "Professional" ? "5" : "1"}</span>
                    </div>
                    <Progress value={org.plan === "Enterprise" ? 30 : ((org.totalClinics || 0) / (org.plan === "Professional" ? 5 : 1)) * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Doctors</span>
                      <span className="font-medium">{org.totalDoctors} / {org.plan === "Enterprise" ? "Unlimited" : org.plan === "Professional" ? "10" : "2"}</span>
                    </div>
                    <Progress value={org.plan === "Enterprise" ? 40 : ((org.totalDoctors || 0) / (org.plan === "Professional" ? 10 : 2)) * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Patients</span>
                      <span className="font-medium">{(org.totalPatients || 0).toLocaleString()} / {org.plan === "Enterprise" ? "Unlimited" : org.plan === "Professional" ? "2,000" : "500"}</span>
                    </div>
                    <Progress value={org.plan === "Enterprise" ? 25 : ((org.totalPatients || 0) / (org.plan === "Professional" ? 2000 : 500)) * 100} className="h-2" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
