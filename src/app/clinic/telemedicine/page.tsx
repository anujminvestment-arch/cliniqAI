"use client";

import { useState } from "react";
import {
  Video,
  CheckCircle2,
  Clock,
  Play,
  Calendar,
  XCircle,
  FileText,
  Settings,
  Disc,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Switch } from "@/components/ui/switch";
import { StatCard } from "@/components/shared/stat-card";

const upcomingStatusColors: Record<string, string> = {
  Scheduled: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  "In Progress": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Waiting: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

const upcomingConsults = [
  { id: "VC-101", patient: "Priya Sharma", doctor: "Dr. Priya Patel", time: "11:00 AM", duration: "30 min", status: "Scheduled" },
  { id: "VC-102", patient: "Rahul Mehta", doctor: "Dr. Amit Shah", time: "11:30 AM", duration: "30 min", status: "In Progress" },
  { id: "VC-103", patient: "Anjali Desai", doctor: "Dr. Neha Gupta", time: "12:00 PM", duration: "30 min", status: "Waiting" },
  { id: "VC-104", patient: "Vikram Singh", doctor: "Dr. Priya Patel", time: "12:30 PM", duration: "30 min", status: "Scheduled" },
  { id: "VC-105", patient: "Neha Gupta", doctor: "Dr. Rajesh Kumar", time: "01:00 PM", duration: "30 min", status: "Scheduled" },
  { id: "VC-106", patient: "Arjun Patel", doctor: "Dr. Amit Shah", time: "01:30 PM", duration: "30 min", status: "Scheduled" },
];

const completedConsults = [
  { id: "VC-097", patient: "Kavita Reddy", doctor: "Dr. Priya Patel", date: "12 Mar 2026", duration: "28 min", recorded: true, notesStatus: "Completed" },
  { id: "VC-098", patient: "Suresh Kumar", doctor: "Dr. Amit Shah", date: "12 Mar 2026", duration: "22 min", recorded: false, notesStatus: "Pending" },
  { id: "VC-099", patient: "Meera Joshi", doctor: "Dr. Neha Gupta", date: "11 Mar 2026", duration: "35 min", recorded: true, notesStatus: "Completed" },
  { id: "VC-100", patient: "Deepak Rao", doctor: "Dr. Rajesh Kumar", date: "11 Mar 2026", duration: "18 min", recorded: true, notesStatus: "Completed" },
];

export default function TelemedicinePage() {
  const [tab, setTab] = useState("upcoming");
  const [videoProvider, setVideoProvider] = useState("jitsi");
  const [autoRecording, setAutoRecording] = useState(true);
  const [waitingRoom, setWaitingRoom] = useState(true);
  const [maxDuration, setMaxDuration] = useState("30");

  const todayCount = upcomingConsults.length;
  const completedThisWeek = completedConsults.length;
  const avgDuration = "26 min";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Telemedicine</h1>
        <p className="text-muted-foreground">Video consultation management</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Today's Video Consults"
          value={todayCount}
          icon={Video}
          color="primary"
        />
        <StatCard
          title="Completed This Week"
          value={completedThisWeek}
          icon={CheckCircle2}
          color="emerald"
          trend={{ value: 18, positive: true }}
        />
        <StatCard
          title="Avg Duration"
          value={avgDuration}
          icon={Clock}
          color="accent"
        />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="upcoming" className="cursor-pointer">
            Upcoming ({upcomingConsults.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="cursor-pointer">
            Completed ({completedConsults.length})
          </TabsTrigger>
          <TabsTrigger value="settings" className="cursor-pointer">
            <Settings className="h-3.5 w-3.5 mr-1" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient Name</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Scheduled Time</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[180px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {upcomingConsults.map((consult) => (
                      <TableRow
                        key={consult.id}
                        className={
                          consult.status === "In Progress"
                            ? "bg-emerald-50/50 dark:bg-emerald-900/5"
                            : ""
                        }
                      >
                        <TableCell className="font-medium">{consult.patient}</TableCell>
                        <TableCell className="text-muted-foreground">{consult.doctor}</TableCell>
                        <TableCell className="font-medium">{consult.time}</TableCell>
                        <TableCell className="text-muted-foreground">{consult.duration}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={upcomingStatusColors[consult.status]}>
                            {consult.status === "In Progress" && <Play className="h-3 w-3 mr-1" />}
                            {consult.status === "Waiting" && <Clock className="h-3 w-3 mr-1" />}
                            {consult.status === "Scheduled" && <Calendar className="h-3 w-3 mr-1" />}
                            {consult.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1.5">
                            {consult.status === "In Progress" ? (
                              <Button size="sm" className="cursor-pointer h-7 text-xs bg-emerald-600 hover:bg-emerald-700">
                                <Play className="h-3 w-3 mr-1" />
                                Join Call
                              </Button>
                            ) : (
                              <Button size="sm" variant="outline" className="cursor-pointer h-7 text-xs">
                                <Video className="h-3 w-3 mr-1" />
                                Start Call
                              </Button>
                            )}
                            <Button size="sm" variant="ghost" className="cursor-pointer h-7 text-xs">
                              <Calendar className="h-3 w-3 mr-1" />
                              Reschedule
                            </Button>
                            <Button size="sm" variant="ghost" className="cursor-pointer h-7 text-xs text-red-600">
                              <XCircle className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {upcomingConsults.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                          No upcoming video consultations.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient Name</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Recording</TableHead>
                      <TableHead>Notes Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {completedConsults.map((consult) => (
                      <TableRow key={consult.id}>
                        <TableCell className="font-medium">{consult.patient}</TableCell>
                        <TableCell className="text-muted-foreground">{consult.doctor}</TableCell>
                        <TableCell className="text-muted-foreground">{consult.date}</TableCell>
                        <TableCell className="text-muted-foreground">{consult.duration}</TableCell>
                        <TableCell>
                          {consult.recorded ? (
                            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                              <Disc className="h-3 w-3 mr-1" />
                              Yes
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                              No
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {consult.notesStatus === "Completed" ? (
                            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                              <FileText className="h-3 w-3 mr-1" />
                              Completed
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                              <Clock className="h-3 w-3 mr-1" />
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {completedConsults.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                          No completed video consultations.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Video Provider</CardTitle>
                <CardDescription>Choose the video call platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Button
                    variant={videoProvider === "jitsi" ? "default" : "outline"}
                    className="cursor-pointer flex-1"
                    onClick={() => setVideoProvider("jitsi")}
                  >
                    Jitsi Meet
                  </Button>
                  <Button
                    variant={videoProvider === "daily" ? "default" : "outline"}
                    className="cursor-pointer flex-1"
                    onClick={() => setVideoProvider("daily")}
                  >
                    Daily.co
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  {videoProvider === "jitsi"
                    ? "Open-source, self-hosted option. No per-minute charges."
                    : "Cloud-hosted with recording & analytics. Usage-based pricing."}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Auto-Recording</CardTitle>
                <CardDescription>Automatically record all video consultations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Record All Consultations</p>
                    <p className="text-xs text-muted-foreground">
                      Recordings are stored securely and accessible for 90 days
                    </p>
                  </div>
                  <Switch
                    checked={autoRecording}
                    onCheckedChange={setAutoRecording}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Waiting Room</CardTitle>
                <CardDescription>Enable a virtual waiting room before consultations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Enable Waiting Room</p>
                    <p className="text-xs text-muted-foreground">
                      Patients wait in a virtual room until the doctor admits them
                    </p>
                  </div>
                  <Switch
                    checked={waitingRoom}
                    onCheckedChange={setWaitingRoom}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Max Duration</CardTitle>
                <CardDescription>Default maximum duration for video consultations</CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={maxDuration} onValueChange={(v) => setMaxDuration(v ?? "30")}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-3">
                  Consultations will auto-end after this duration. Doctors can extend if needed.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
