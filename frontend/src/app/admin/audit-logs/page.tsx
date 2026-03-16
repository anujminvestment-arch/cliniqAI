"use client";

import { useState, useEffect } from "react";
import {
  Shield,
  Search,
  Download,
  Eye,
  Pencil,
  Trash2,
  Bot,
  UserRound,
  Server,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Spinner } from "@/components/shared/spinner";
import { Pagination } from "@/components/shared/pagination";
import { compliance } from "@/lib/api";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";

const actionColors: Record<string, string> = {
  VIEW_RECORD: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  CREATE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  UPDATE_SETTINGS: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  COMPLETE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  UPDATE_QUEUE: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  AI_CALL: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  SEND_REMINDER: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  CREATE_INVOICE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  SHARE_RX: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  PRESCRIBE: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  SUSPEND_CLINIC: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  BACKUP: "bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400",
};

function getUserIcon(user: string) {
  if (user.startsWith("System") || user === "System") return Server;
  if (user.includes("AI")) return Bot;
  return UserRound;
}

export default function AuditLogsPage() {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const PAGE_SIZE = 20;

  useEffect(() => {
    async function fetchLogs() {
      try {
        const data = await compliance.auditLogs({ limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE });
        setAuditLogs((data as any).audit_logs || []);
        setTotal((data as any).total || (data as any).audit_logs?.length || 0);
      } catch (err) {
        console.error("Failed to load audit logs:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, [page]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  const uniqueActions = Array.from(new Set(auditLogs.map((l: any) => l.action)));

  const filtered = auditLogs.filter((log: any) => {
    const matchesSearch =
      (log.user || "").toLowerCase().includes(search.toLowerCase()) ||
      (log.resource || "").toLowerCase().includes(search.toLowerCase()) ||
      (log.details || "").toLowerCase().includes(search.toLowerCase());
    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-6">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>Audit Logs</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight section-header">Audit Logs</h1>
          <p className="text-muted-foreground">Track all system activity and user actions</p>
        </div>
        <Button variant="outline" className="cursor-pointer w-fit">
          <Download className="h-4 w-4 mr-1.5" />
          Export Logs
        </Button>
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base flex items-center gap-2 section-header">
              <Shield className="h-4 w-4 text-primary" />
              Activity Log
            </CardTitle>
            <div className="flex gap-2">
              <div className="relative max-w-xs">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  className="pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={actionFilter} onValueChange={(v) => setActionFilter(v ?? "all")}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {uniqueActions.map((a) => (
                    <SelectItem key={a} value={a}>{a.replace(/_/g, " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table className="table-enhanced">
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>IP Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((log: any) => {
                const UserIcon = getUserIcon(log.user || "");
                return (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                      {log.timestamp}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <UserIcon className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm font-medium">{log.user}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`text-[10px] ${actionColors[log.action] || "bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400"}`}
                      >
                        {(log.action || "").replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm max-w-[200px] truncate">{log.resource}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[250px] truncate">
                      {log.details}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{log.ip}</TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No logs match your search.
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
