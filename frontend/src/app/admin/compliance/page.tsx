"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheck,
  FileCheck,
  Activity,
  Award,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { StatCard } from "@/components/shared/stat-card";
import { Spinner } from "@/components/shared/spinner";
import { compliance } from "@/lib/api";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ConsentRecord {
  id: string;
  patient_id: string;
  consent_type: string;
  granted: boolean;
  created_at: string;
  revoked_at: string | null;
}

interface ChecklistItem {
  id: string;
  name: string;
  status: "Compliant" | "Non-Compliant" | "Partial";
}

// ---------------------------------------------------------------------------
// Static checklist (configuration, not API data)
// ---------------------------------------------------------------------------

const complianceChecklist: ChecklistItem[] = [
  { id: "CHK-01", name: "Encryption at Rest", status: "Compliant" },
  { id: "CHK-02", name: "Encryption in Transit", status: "Compliant" },
  { id: "CHK-03", name: "Audit Logging", status: "Compliant" },
  { id: "CHK-04", name: "Consent Collection", status: "Compliant" },
  { id: "CHK-05", name: "Data Export API", status: "Partial" },
  { id: "CHK-06", name: "Right to Deletion", status: "Partial" },
  { id: "CHK-07", name: "Access Controls", status: "Compliant" },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const consentStatusColors: Record<string, string> = {
  Granted: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Revoked: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const consentTypeColors: Record<string, string> = {
  "Data Processing": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Treatment: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  "Record Sharing": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

const checklistStatusColors: Record<string, string> = {
  Compliant: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  "Non-Compliant": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  Partial: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

function ChecklistIcon({ status }: { status: string }) {
  if (status === "Compliant") return <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
  if (status === "Non-Compliant") return <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />;
  return <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function CompliancePage() {
  const [consentSearch, setConsentSearch] = useState("");
  const [consentTypeFilter, setConsentTypeFilter] = useState("all");
  const [consentRecords, setConsentRecords] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    compliance
      .consents()
      .then((data) => setConsentRecords(data.consents ?? []))
      .catch(() => setConsentRecords([]))
      .finally(() => setLoading(false));
  }, []);

  // Derive display status from API fields
  const displayRecords = consentRecords.map((r) => ({
    ...r,
    status: r.revoked_at ? "Revoked" : r.granted ? "Granted" : "Revoked",
    displayType: r.consent_type,
  }));

  // Consent filtering
  const filteredConsent = displayRecords.filter((r) => {
    const matchesSearch =
      r.patient_id.toLowerCase().includes(consentSearch.toLowerCase()) ||
      r.consent_type.toLowerCase().includes(consentSearch.toLowerCase());
    const matchesType = consentTypeFilter === "all" || r.consent_type === consentTypeFilter;
    return matchesSearch && matchesType;
  });

  // Stat computations
  const grantedCount = displayRecords.filter((r) => r.status === "Granted").length;
  const consentRate =
    displayRecords.length > 0
      ? ((grantedCount / displayRecords.length) * 100).toFixed(1)
      : "0";
  const compliantCount = complianceChecklist.filter((c) => c.status === "Compliant").length;
  const complianceScore = Math.round((compliantCount / complianceChecklist.length) * 100);

  // Unique consent types for filter
  const consentTypes = [...new Set(consentRecords.map((r) => r.consent_type).filter(Boolean))];

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>Compliance</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div>
        <h1 className="text-2xl font-bold tracking-tight section-header">DPDPA Compliance</h1>
        <p className="text-muted-foreground">
          Data protection, consent management, and compliance monitoring
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Consent Rate"
          value={`${consentRate}%`}
          icon={ShieldCheck}
          color="emerald"
          delay={0}
        />
        <StatCard
          title="Total Consents"
          value={consentRecords.length}
          icon={FileCheck}
          color="primary"
          delay={75}
        />
        <StatCard
          title="Granted"
          value={grantedCount}
          icon={Activity}
          color="violet"
          delay={150}
        />
        <StatCard
          title="Compliance Score"
          value={`${complianceScore}%`}
          icon={Award}
          color="amber"
          description={`${compliantCount}/${complianceChecklist.length} items compliant`}
          delay={225}
        />
      </div>

      {/* Consent Records */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 section-header">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Consent Records
          </CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row pt-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search patient or type..."
                className="pl-8"
                value={consentSearch}
                onChange={(e) => setConsentSearch(e.target.value)}
              />
            </div>
            {consentTypes.length > 0 && (
              <Select value={consentTypeFilter} onValueChange={(v) => setConsentTypeFilter(v ?? "all")}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {consentTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto scrollbar-thin">
            <Table className="table-enhanced">
              <TableHeader>
                <TableRow>
                  <TableHead>Patient ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Revoked</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredConsent.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium text-sm">{record.patient_id}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={`text-[10px] ${consentTypeColors[record.consent_type] ?? ""}`}>
                        {record.consent_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={consentStatusColors[record.status]}>
                        {record.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(record.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {record.revoked_at
                        ? new Date(record.revoked_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredConsent.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      No consent records match your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 section-header">
            <Award className="h-4 w-4 text-primary" />
            Compliance Checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border">
            {complianceChecklist.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <ChecklistIcon status={item.status} />
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
                <Badge variant="secondary" className={checklistStatusColors[item.status]}>
                  {item.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
