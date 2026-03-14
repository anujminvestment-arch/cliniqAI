"use client";

import { useState } from "react";
import {
  Video,
  VideoOff,
  Clock,
  CalendarDays,
  MapPin,
  Stethoscope,
  FileText,
  Pill,
  Wifi,
  Camera,
  Mic,
  Volume2,
  Monitor,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatCard } from "@/components/shared/stat-card";

interface VideoConsultation {
  id: string;
  doctor: string;
  doctorInitials: string;
  specialty: string;
  dateTime: string;
  duration: string;
  clinic: string;
  status: "Scheduled" | "Confirmed" | "Completed" | "Cancelled";
}

const upcomingConsultations: VideoConsultation[] = [
  {
    id: "vc-1",
    doctor: "Dr. Priya Sharma",
    doctorInitials: "PS",
    specialty: "General Physician",
    dateTime: "2026-03-13 04:30 PM",
    duration: "30 min",
    clinic: "CliniqAI Health Center",
    status: "Confirmed",
  },
  {
    id: "vc-2",
    doctor: "Dr. Rohit Mehta",
    doctorInitials: "RM",
    specialty: "Cardiologist",
    dateTime: "2026-03-17 11:00 AM",
    duration: "30 min",
    clinic: "CliniqAI Cardiology",
    status: "Scheduled",
  },
  {
    id: "vc-3",
    doctor: "Dr. Anita Desai",
    doctorInitials: "AD",
    specialty: "Pediatrician",
    dateTime: "2026-03-20 02:00 PM",
    duration: "30 min",
    clinic: "CliniqAI Kids Clinic",
    status: "Scheduled",
  },
];

const pastConsultations: VideoConsultation[] = [
  {
    id: "vc-4",
    doctor: "Dr. Sunil Verma",
    doctorInitials: "SV",
    specialty: "General Physician",
    dateTime: "2026-03-05 10:00 AM",
    duration: "25 min",
    clinic: "CliniqAI Health Center",
    status: "Completed",
  },
  {
    id: "vc-5",
    doctor: "Dr. Kavita Rao",
    doctorInitials: "KR",
    specialty: "Orthopedic",
    dateTime: "2026-02-22 03:30 PM",
    duration: "20 min",
    clinic: "CliniqAI Ortho Clinic",
    status: "Completed",
  },
  {
    id: "vc-6",
    doctor: "Dr. Priya Sharma",
    doctorInitials: "PS",
    specialty: "General Physician",
    dateTime: "2026-02-10 09:00 AM",
    duration: "30 min",
    clinic: "CliniqAI Health Center",
    status: "Completed",
  },
];

function getStatusColor(status: string): string {
  switch (status) {
    case "Confirmed":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    case "Scheduled":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    case "Completed":
      return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
    case "Cancelled":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    default:
      return "";
  }
}

export default function TelemedicinePage() {
  const [nextConsultation] = useState(upcomingConsultations[0]);
  const remainingUpcoming = upcomingConsultations.slice(1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Telemedicine</h1>
        <p className="text-muted-foreground">Join video consultations with your doctors from anywhere</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Upcoming Sessions"
          value={upcomingConsultations.length}
          icon={Video}
          color="primary"
          delay={0}
        />
        <StatCard
          title="Completed Sessions"
          value={pastConsultations.length}
          icon={CheckCircle2}
          color="emerald"
          delay={100}
        />
        <StatCard
          title="This Month"
          value={2}
          icon={CalendarDays}
          color="accent"
          delay={200}
        />
        <StatCard
          title="Avg Duration"
          value="25 min"
          icon={Clock}
          color="violet"
          delay={300}
        />
      </div>

      {/* Next Video Consultation Hero */}
      {nextConsultation && (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 animate-fade-in-up">
          <CardContent className="p-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16 text-xl">
                  <AvatarFallback className="bg-primary/20 text-primary">
                    {nextConsultation.doctorInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-medium text-primary uppercase tracking-wider">Next Video Consultation</p>
                    <h2 className="text-xl font-bold mt-1">{nextConsultation.doctor}</h2>
                    <p className="text-sm text-muted-foreground">{nextConsultation.specialty}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {nextConsultation.dateTime}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      {nextConsultation.clinic}
                    </span>
                    <Badge variant="secondary" className={getStatusColor(nextConsultation.status)}>
                      {nextConsultation.status}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-primary">
                    <Clock className="h-3.5 w-3.5 inline mr-1" />
                    Starts in 2 hours 15 minutes
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-stretch gap-3 lg:items-end lg:min-w-[200px]">
                <Button size="lg" className="cursor-pointer text-base gap-2">
                  <Video className="h-5 w-5" />
                  Join Video Call
                </Button>
                <Button variant="outline" size="sm" className="cursor-pointer">
                  Reschedule
                </Button>
              </div>
            </div>

            <Separator className="my-5" />

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="flex items-center gap-2.5 rounded-lg bg-background/60 px-3 py-2.5">
                <Wifi className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="text-sm">Ensure stable internet connection</span>
              </div>
              <div className="flex items-center gap-2.5 rounded-lg bg-background/60 px-3 py-2.5">
                <Camera className="h-4 w-4 text-blue-500 shrink-0" />
                <span className="text-sm">Allow camera & microphone access</span>
              </div>
              <div className="flex items-center gap-2.5 rounded-lg bg-background/60 px-3 py-2.5">
                <Volume2 className="h-4 w-4 text-violet-500 shrink-0" />
                <span className="text-sm">Join from a quiet place</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Video Consultations */}
      {remainingUpcoming.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Upcoming Video Consultations</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {remainingUpcoming.map((consultation) => (
              <Card key={consultation.id} className="animate-fade-in-up">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {consultation.doctorInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{consultation.doctor}</p>
                        <p className="text-xs text-muted-foreground">{consultation.specialty}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className={getStatusColor(consultation.status)}>
                      {consultation.status}
                    </Badge>
                  </div>

                  <Separator />

                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {consultation.dateTime}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      {consultation.duration}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      {consultation.clinic}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" className="cursor-pointer flex-1" disabled>
                      <Video className="h-3.5 w-3.5 mr-1.5" />
                      Join
                    </Button>
                    <Button variant="outline" size="sm" className="cursor-pointer">
                      Reschedule
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Join button activates 5 minutes before the session
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Past Video Consultations */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Past Video Consultations</h2>
        <div className="grid gap-4">
          {pastConsultations.map((consultation) => (
            <Card key={consultation.id} className="animate-fade-in-up">
              <CardContent className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-muted text-muted-foreground">
                        {consultation.doctorInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{consultation.doctor}</p>
                      <p className="text-xs text-muted-foreground">{consultation.specialty}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {consultation.dateTime}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      {consultation.duration}
                    </span>
                    <Badge variant="secondary" className={getStatusColor(consultation.status)}>
                      {consultation.status}
                    </Badge>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="cursor-pointer">
                      <FileText className="h-3.5 w-3.5 mr-1.5" />
                      View Notes
                    </Button>
                    <Button variant="outline" size="sm" className="cursor-pointer">
                      <Pill className="h-3.5 w-3.5 mr-1.5" />
                      View Prescription
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
