"use client";

import { useState } from "react";
import {
  CalendarCheck,
  Plus,
  Search,
  Phone,
  MessageSquare,
  UserRound,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Bot,
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
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatCard } from "@/components/shared/stat-card";
import { followUpsList, patientsList, doctorsList } from "@/lib/mock-data";

const statusColors: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  overdue: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
};

const typeIcons: Record<string, React.ElementType> = {
  "AI Call": Phone,
  SMS: MessageSquare,
  "In-Person": UserRound,
};

export default function FollowUpsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tab, setTab] = useState("upcoming");

  const upcoming = followUpsList.filter((f) => f.status === "scheduled");
  const overdue = followUpsList.filter((f) => f.status === "overdue");
  const completed = followUpsList.filter((f) => f.status === "completed");
  const autoScheduled = followUpsList.filter((f) => f.autoScheduled).length;

  const currentList =
    tab === "upcoming" ? upcoming : tab === "overdue" ? overdue : completed;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Follow-ups</h1>
          <p className="text-muted-foreground">Track and manage patient follow-up schedules</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button className="cursor-pointer w-fit">
                <Plus className="h-4 w-4 mr-1.5" />
                Schedule Follow-up
              </Button>
            }
          />
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Schedule Follow-up</DialogTitle>
              <DialogDescription>Create a new follow-up for a patient.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label>Patient</Label>
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patientsList.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Doctor</Label>
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctorsList.map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label>Date</Label>
                  <Input type="date" />
                </div>
                <div className="grid gap-2">
                  <Label>Type</Label>
                  <Select>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="In-Person">In-Person</SelectItem>
                      <SelectItem value="AI Call">AI Call</SelectItem>
                      <SelectItem value="SMS">SMS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Reason</Label>
                <Input placeholder="e.g. Post-procedure check" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" className="cursor-pointer" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button className="cursor-pointer" onClick={() => setDialogOpen(false)}>
                Schedule
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard title="Upcoming" value={upcoming.length} icon={CalendarCheck} color="primary" />
        <StatCard title="Overdue" value={overdue.length} icon={AlertTriangle} color="rose" description="Needs attention" />
        <StatCard title="Completed" value={completed.length} icon={CheckCircle2} color="emerald" />
        <StatCard title="AI Auto-scheduled" value={autoScheduled} icon={Bot} color="violet" description="Scheduled by AI" />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="upcoming" className="cursor-pointer">
            Upcoming ({upcoming.length})
          </TabsTrigger>
          <TabsTrigger value="overdue" className="cursor-pointer">
            Overdue ({overdue.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="cursor-pointer">
            Completed ({completed.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Scheduled Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Source</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentList.map((followUp) => {
                    const TypeIcon = typeIcons[followUp.type] || CalendarCheck;
                    return (
                      <TableRow key={followUp.id} className={followUp.status === "overdue" ? "bg-red-50/50 dark:bg-red-900/5" : ""}>
                        <TableCell className="font-medium">{followUp.patient}</TableCell>
                        <TableCell className="text-muted-foreground">{followUp.doctor}</TableCell>
                        <TableCell className={followUp.status === "overdue" ? "text-red-600 dark:text-red-400 font-medium" : ""}>
                          {followUp.scheduledDate}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <TypeIcon className="h-3.5 w-3.5 text-muted-foreground" />
                            {followUp.type}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px] text-muted-foreground">{followUp.reason}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={statusColors[followUp.status]}>
                            {followUp.status.charAt(0).toUpperCase() + followUp.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {followUp.autoScheduled ? (
                            <Badge variant="outline" className="text-[10px]">
                              <Bot className="h-3 w-3 mr-1" />
                              Auto
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px]">Manual</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {currentList.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                        No follow-ups in this category.
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
