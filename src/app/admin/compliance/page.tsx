"use client";

import { useState } from "react";
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

// ---------------------------------------------------------------------------
// Inline mock data
// ---------------------------------------------------------------------------

interface ConsentRecord {
  id: string;
  patientName: string;
  clinic: string;
  consentType: "Data Processing" | "Treatment" | "Record Sharing";
  status: "Granted" | "Revoked";
  date: string;
}

interface DataExportRequest {
  id: string;
  patient: string;
  status: "Pending" | "Processing" | "Completed" | "Rejected";
  requestedDate: string;
  completedDate: string;
}

interface ChecklistItem {
  id: string;
  name: string;
  status: "Compliant" | "Non-Compliant" | "Partial";
}

const consentRecords: ConsentRecord[] = [
  { id: "CST-001", patientName: "Aarav Sharma", clinic: "SmileCare Dental", consentType: "Data Processing", status: "Granted", date: "2026-03-12" },
  { id: "CST-002", patientName: "Priya Patel", clinic: "HealthFirst Clinic", consentType: "Treatment", status: "Granted", date: "2026-03-12" },
  { id: "CST-003", patientName: "Rohit Mehra", clinic: "DermGlow Skin Centre", consentType: "Record Sharing", status: "Revoked", date: "2026-03-11" },
  { id: "CST-004", patientName: "Ananya Iyer", clinic: "PediaCare Children's Hospital", consentType: "Data Processing", status: "Granted", date: "2026-03-11" },
  { id: "CST-005", patientName: "Vikram Singh", clinic: "BrightEyes Vision", consentType: "Treatment", status: "Granted", date: "2026-03-10" },
  { id: "CST-006", patientName: "Neha Gupta", clinic: "SmileCare Dental", consentType: "Record Sharing", status: "Revoked", date: "2026-03-10" },
  { id: "CST-007", patientName: "Kabir Joshi", clinic: "HeartBeat Cardiology", consentType: "Data Processing", status: "Granted", date: "2026-03-09" },
  { id: "CST-008", patientName: "Diya Reddy", clinic: "OrthoCure Physiotherapy", consentType: "Treatment", status: "Granted", date: "2026-03-09" },
];

const dataExportRequests: DataExportRequest[] = [
  { id: "EXP-001", patient: "Rohit Mehra", status: "Completed", requestedDate: "2026-03-08", completedDate: "2026-03-10" },
  { id: "EXP-002", patient: "Neha Gupta", status: "Processing", requestedDate: "2026-03-11", completedDate: "—" },
  { id: "EXP-003", patient: "Aarav Sharma", status: "Pending", requestedDate: "2026-03-12", completedDate: "—" },
  { id: "EXP-004", patient: "Priya Patel", status: "Completed", requestedDate: "2026-03-05", completedDate: "2026-03-07" },
  { id: "EXP-005", patient: "Vikram Singh", status: "Rejected", requestedDate: "2026-03-06", completedDate: "—" },
  { id: "EXP-006", patient: "Kabir Joshi", status: "Pending", requestedDate: "2026-03-13", completedDate: "—" },
];

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

const exportStatusColors: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Processing: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
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
  const [exportStatusFilter, setExportStatusFilter] = useState("all");

  // Consent filtering
  const filteredConsent = consentRecords.filter((r) => {
    const matchesSearch =
      r.patientName.toLowerCase().includes(consentSearch.toLowerCase()) ||
      r.clinic.toLowerCase().includes(consentSearch.toLowerCase());
    const matchesType = consentTypeFilter === "all" || r.consentType === consentTypeFilter;
    return matchesSearch && matchesType;
  });

  // Export request filtering
  const filteredExports = dataExportRequests.filter((r) => {
    return exportStatusFilter === "all" || r.status === exportStatusFilter;
  });

  // Stat computations
  const consentRate =
    ((consentRecords.filter((r) => r.status === "Granted").length / consentRecords.length) * 100).toFixed(1);
  const exportRequestCount = dataExportRequests.length;
  const auditEventsToday = 847;
  const compliantCount = complianceChecklist.filter((c) => c.status === "Compliant").length;
  const complianceScore = Math.round((compliantCount / complianceChecklist.length) * 100);

  return (
    <div className="space-y-6">
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
          trend={{ value: 3.2, positive: true }}
          delay={0}
        />
        <StatCard
          title="Data Export Requests"
          value={exportRequestCount}
          icon={FileCheck}
          color="primary"
          description={`${dataExportRequests.filter((r) => r.status === "Pending").length} pending`}
          delay={75}
        />
        <StatCard
          title="Audit Events Today"
          value={auditEventsToday.toLocaleString()}
          icon={Activity}
          color="violet"
          trend={{ value: 5, positive: true }}
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

      {/* Side-by-side tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Consent Records */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 section-header">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Recent Consent Records
            </CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row pt-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search patient or clinic..."
                  className="pl-8"
                  value={consentSearch}
                  onChange={(e) => setConsentSearch(e.target.value)}
                />
              </div>
              <Select value={consentTypeFilter} onValueChange={(v) => setConsentTypeFilter(v ?? "all")}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Data Processing">Data Processing</SelectItem>
                  <SelectItem value="Treatment">Treatment</SelectItem>
                  <SelectItem value="Record Sharing">Record Sharing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto scrollbar-thin">
              <Table className="table-enhanced">
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Clinic</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredConsent.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium text-sm">{record.patientName}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{record.clinic}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={`text-[10px] ${consentTypeColors[record.consentType]}`}>
                          {record.consentType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={consentStatusColors[record.status]}>
                          {record.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {record.date}
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

        {/* Data Export Requests */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 section-header">
              <FileCheck className="h-4 w-4 text-primary" />
              Data Export Requests
            </CardTitle>
            <div className="flex pt-2">
              <Select value={exportStatusFilter} onValueChange={(v) => setExportStatusFilter(v ?? "all")}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Processing">Processing</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto scrollbar-thin">
              <Table className="table-enhanced">
                <TableHeader>
                  <TableRow>
                    <TableHead>Request ID</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead>Completed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExports.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell className="font-mono text-xs text-muted-foreground">{req.id}</TableCell>
                      <TableCell className="font-medium text-sm">{req.patient}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={exportStatusColors[req.status]}>
                          {req.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {req.requestedDate}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {req.completedDate}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredExports.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        No export requests match your filter.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

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
