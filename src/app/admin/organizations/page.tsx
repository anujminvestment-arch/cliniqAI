"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building,
  Plus,
  Search,
  Eye,
  Pencil,
  MoreHorizontal,
  Users,
  IndianRupee,
  TrendingUp,
  MapPin,
  CheckCircle2,
  Clock,
  XCircle,
  Ban,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { StatCard } from "@/components/shared/stat-card";
import { organizationsList, orgGrowthData } from "@/lib/mock-data";

const statusColors: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  suspended: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const planColors: Record<string, string> = {
  Basic: "bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400",
  Professional: "bg-primary/10 text-primary",
  Enterprise: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
};

const growthConfig = {
  organizations: { label: "Organizations", color: "var(--chart-1)" },
  clinics: { label: "Clinics", color: "var(--chart-2)" },
};

export default function OrganizationsPage() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");

  const filtered = organizationsList.filter((org) => {
    const matchesSearch =
      org.name.toLowerCase().includes(search.toLowerCase()) ||
      org.owner.toLowerCase().includes(search.toLowerCase()) ||
      org.email.toLowerCase().includes(search.toLowerCase());
    const matchesTab = tab === "all" || org.status === tab;
    return matchesSearch && matchesTab;
  });

  const totalOrgs = organizationsList.length;
  const activeOrgs = organizationsList.filter((o) => o.status === "active").length;
  const totalClinicsAll = organizationsList.reduce((sum, o) => sum + o.totalClinics, 0);
  const totalRevenueAll = organizationsList.reduce((sum, o) => sum + o.monthlyRevenue, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Organizations</h1>
          <p className="text-muted-foreground">Manage enrolled organizations and their clinics</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/onboarding">
            <Button className="cursor-pointer">
              <Plus className="h-4 w-4 mr-1.5" />
              Enroll Organization
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Organizations" value={totalOrgs} icon={Building} color="primary" trend={{ value: 12, positive: true }} />
        <StatCard title="Active" value={activeOrgs} icon={CheckCircle2} color="emerald" />
        <StatCard title="Total Clinics" value={totalClinicsAll} icon={MapPin} color="accent" />
        <StatCard title="Monthly Revenue" value={`₹${(totalRevenueAll / 100000).toFixed(1)}L`} icon={IndianRupee} color="violet" trend={{ value: 15, positive: true }} />
      </div>

      {/* Growth Chart */}
      <Card className="animate-fade-in-up">
        <CardHeader>
          <CardTitle className="text-base">Organization & Clinic Growth</CardTitle>
          <CardDescription>Monthly enrollment trends</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={growthConfig} className="h-[250px] w-full">
            <BarChart data={orgGrowthData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey="organizations" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="clinics" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Search + Filter */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search organizations..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Org Table */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all" className="cursor-pointer">
            All ({organizationsList.length})
          </TabsTrigger>
          <TabsTrigger value="active" className="cursor-pointer">
            Active ({organizationsList.filter((o) => o.status === "active").length})
          </TabsTrigger>
          <TabsTrigger value="pending" className="cursor-pointer">
            Pending ({organizationsList.filter((o) => o.status === "pending").length})
          </TabsTrigger>
          <TabsTrigger value="suspended" className="cursor-pointer">
            Suspended ({organizationsList.filter((o) => o.status === "suspended").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Organization</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead className="text-center">Clinics</TableHead>
                    <TableHead className="text-center">Doctors</TableHead>
                    <TableHead className="text-center">Patients</TableHead>
                    <TableHead>Revenue/mo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[60px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((org) => (
                    <TableRow key={org.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                            <Building className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{org.name}</p>
                            <p className="text-xs text-muted-foreground">{org.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{org.owner}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={planColors[org.plan]}>
                          {org.plan}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-medium">{org.totalClinics}</TableCell>
                      <TableCell className="text-center">{org.totalDoctors}</TableCell>
                      <TableCell className="text-center">{org.totalPatients.toLocaleString()}</TableCell>
                      <TableCell className="font-medium">
                        {org.monthlyRevenue > 0 ? `₹${(org.monthlyRevenue / 1000).toFixed(0)}K` : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={statusColors[org.status]}>
                          {org.status.charAt(0).toUpperCase() + org.status.slice(1)}
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
                            <Link href={`/admin/organizations/${org.id}`}>
                              <DropdownMenuItem className="cursor-pointer">
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                            </Link>
                            <DropdownMenuItem className="cursor-pointer">
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {org.status === "suspended" ? (
                              <DropdownMenuItem className="cursor-pointer">
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Reactivate
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem className="cursor-pointer" variant="destructive">
                                <Ban className="mr-2 h-4 w-4" />
                                Suspend
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                        No organizations found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
