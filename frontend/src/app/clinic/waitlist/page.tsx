"use client";

import { useState } from "react";
import {
  ListOrdered,
  CheckCircle2,
  Clock,
  Bell,
  CalendarPlus,
  Trash2,
  Inbox,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { StatCard } from "@/components/shared/stat-card";

const urgencyColors: Record<string, string> = {
  Low: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  High: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const statusColors: Record<string, string> = {
  Waiting: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Notified: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Booked: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Expired: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const waitlistRecords = [
  { id: "WL-001", position: 1, patient: "Anita Verma", doctor: "Dr. Priya Patel", preferredDate: "14 Mar 2026", urgency: "High", addedOn: "12 Mar 2026", status: "Waiting" },
  { id: "WL-002", position: 2, patient: "Ravi Shankar", doctor: "Dr. Amit Shah", preferredDate: "14 Mar 2026", urgency: "Medium", addedOn: "12 Mar 2026", status: "Notified" },
  { id: "WL-003", position: 3, patient: "Sunita Devi", doctor: "Dr. Priya Patel", preferredDate: "15 Mar 2026", urgency: "Low", addedOn: "13 Mar 2026", status: "Waiting" },
  { id: "WL-004", position: 4, patient: "Manoj Tiwari", doctor: "Dr. Neha Gupta", preferredDate: "15 Mar 2026", urgency: "High", addedOn: "13 Mar 2026", status: "Booked" },
  { id: "WL-005", position: 5, patient: "Lakshmi Nair", doctor: "Dr. Amit Shah", preferredDate: "16 Mar 2026", urgency: "Medium", addedOn: "13 Mar 2026", status: "Waiting" },
  { id: "WL-006", position: 6, patient: "Rajesh Kapoor", doctor: "Dr. Neha Gupta", preferredDate: "13 Mar 2026", urgency: "Low", addedOn: "11 Mar 2026", status: "Expired" },
];

export default function WaitlistPage() {
  const [autoFill, setAutoFill] = useState(true);

  const currentlyWaitlisted = waitlistRecords.filter(
    (r) => r.status === "Waiting" || r.status === "Notified"
  ).length;
  const filledToday = waitlistRecords.filter((r) => r.status === "Booked").length;
  const avgWaitDuration = "1.8 days";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight section-header">Waitlist</h1>
          <p className="text-muted-foreground">Manage patients waiting for available slots</p>
        </div>
        <div className="flex items-center gap-3 rounded-lg border px-4 py-2.5">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />
            <div>
              <p className="text-sm font-medium">Auto-fill Slots</p>
              <p className="text-xs text-muted-foreground">
                Automatically notify & book when slots open
              </p>
            </div>
          </div>
          <Switch
            checked={autoFill}
            onCheckedChange={setAutoFill}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Currently Waitlisted"
          value={currentlyWaitlisted}
          icon={ListOrdered}
          color="amber"
          description="Waiting for slots"
        />
        <StatCard
          title="Filled from Waitlist Today"
          value={filledToday}
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Avg Wait Duration"
          value={avgWaitDuration}
          icon={Clock}
          color="rose"
        />
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="text-base">Waitlist Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto scrollbar-thin">
            <Table className="table-enhanced">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">#</TableHead>
                  <TableHead>Patient Name</TableHead>
                  <TableHead>Doctor Requested</TableHead>
                  <TableHead>Preferred Date</TableHead>
                  <TableHead>Urgency</TableHead>
                  <TableHead>Added On</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[130px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {waitlistRecords.map((record) => (
                  <TableRow
                    key={record.id}
                    className={
                      record.urgency === "High" && record.status === "Waiting"
                        ? "bg-red-50/50 dark:bg-red-900/5"
                        : ""
                    }
                  >
                    <TableCell className="font-bold text-center">{record.position}</TableCell>
                    <TableCell className="font-medium">{record.patient}</TableCell>
                    <TableCell className="text-muted-foreground">{record.doctor}</TableCell>
                    <TableCell className="text-muted-foreground">{record.preferredDate}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={urgencyColors[record.urgency]}>
                        {record.urgency}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{record.addedOn}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={statusColors[record.status]}>
                        {record.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {(record.status === "Waiting" || record.status === "Notified") && (
                          <>
                            <Button variant="ghost" size="icon-sm" className="cursor-pointer text-blue-600" title="Notify">
                              <Bell className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon-sm" className="cursor-pointer text-emerald-600" title="Book">
                              <CalendarPlus className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon-sm" className="cursor-pointer text-red-600" title="Remove">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {record.status === "Booked" && (
                          <Badge variant="outline" className="text-[10px] text-emerald-600">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Done
                          </Badge>
                        )}
                        {record.status === "Expired" && (
                          <Badge variant="outline" className="text-[10px] text-muted-foreground">
                            Expired
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {waitlistRecords.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Inbox className="h-10 w-10 text-muted-foreground/30" />
                        <p className="font-medium">Waitlist is empty</p>
                        <p className="text-sm">No patients are currently waiting for slots</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
