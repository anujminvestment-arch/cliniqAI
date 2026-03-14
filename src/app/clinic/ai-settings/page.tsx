"use client";

import { useState } from "react";
import {
  Mic,
  Phone,
  CalendarDays,
  ListOrdered,
  Clock,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { aiCallAnalytics } from "@/lib/mock-data";

export default function AISettingsPage() {
  const [aiEnabled, setAiEnabled] = useState(true);
  const [greeting, setGreeting] = useState(
    "Hello! Thank you for calling SmileCare Dental. I'm your AI assistant. How can I help you today?"
  );
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("20:00");
  const [bookAppointments, setBookAppointments] = useState(true);
  const [shareQueue, setShareQueue] = useState(true);
  const [provideTimings, setProvideTimings] = useState(true);
  const [cancelAppointments, setCancelAppointments] = useState(false);

  const latestStats = aiCallAnalytics[aiCallAnalytics.length - 1];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight section-header">AI Voice Settings</h1>
        <p className="text-muted-foreground">Configure the AI Voice Receptionist for your clinic</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Mic className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">AI Voice Receptionist</CardTitle>
                    <CardDescription>
                      {aiEnabled ? "Active and handling calls" : "Currently disabled"}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {aiEnabled && (
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
                    </span>
                  )}
                  <Switch
                    checked={aiEnabled}
                    onCheckedChange={setAiEnabled}
                    className="cursor-pointer"
                  />
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Greeting Message</CardTitle>
              <CardDescription>The message played when a patient calls</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={greeting}
                onChange={(e) => setGreeting(e.target.value)}
                rows={3}
                placeholder="Enter greeting message..."
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Working Hours</CardTitle>
              <CardDescription>AI will handle calls during these hours</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="grid gap-2 flex-1">
                  <Label htmlFor="start-time">Start Time</Label>
                  <Input
                    id="start-time"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                <span className="mt-6 text-muted-foreground font-medium">to</span>
                <div className="grid gap-2 flex-1">
                  <Label htmlFor="end-time">End Time</Label>
                  <Input
                    id="end-time"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Auto-Responses</CardTitle>
              <CardDescription>Configure what the AI can handle automatically</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Book Appointments</p>
                    <p className="text-xs text-muted-foreground">Allow AI to schedule appointments</p>
                  </div>
                </div>
                <Switch
                  checked={bookAppointments}
                  onCheckedChange={setBookAppointments}
                  className="cursor-pointer"
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ListOrdered className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Share Queue Status</p>
                    <p className="text-xs text-muted-foreground">Provide real-time queue information</p>
                  </div>
                </div>
                <Switch
                  checked={shareQueue}
                  onCheckedChange={setShareQueue}
                  className="cursor-pointer"
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Provide Timings</p>
                    <p className="text-xs text-muted-foreground">Share clinic and doctor schedules</p>
                  </div>
                </div>
                <Switch
                  checked={provideTimings}
                  onCheckedChange={setProvideTimings}
                  className="cursor-pointer"
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Cancel Appointments</p>
                    <p className="text-xs text-muted-foreground">Allow AI to cancel on patient request</p>
                  </div>
                </div>
                <Switch
                  checked={cancelAppointments}
                  onCheckedChange={setCancelAppointments}
                  className="cursor-pointer"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Today&apos;s AI Call Stats</CardTitle>
              <CardDescription>{latestStats.date}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-4 text-center">
                <Phone className="h-5 w-5 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold">{latestStats.calls}</p>
                <p className="text-xs text-muted-foreground">Total Calls</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">
                    {latestStats.booked}
                  </p>
                  <p className="text-xs text-muted-foreground">Booked</p>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-xl font-bold">{latestStats.duration}</p>
                  <p className="text-xs text-muted-foreground">Avg Duration</p>
                </div>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <p className="text-lg font-bold text-primary">
                  {Math.round((latestStats.booked / latestStats.calls) * 100)}%
                </p>
                <p className="text-xs text-muted-foreground">Booking Success Rate</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
