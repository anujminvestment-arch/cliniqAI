"use client";

import { useState } from "react";
import {
  Users,
  UserPlus,
  CalendarDays,
  Clock,
  Stethoscope,
  MapPin,
  FileText,
  CalendarPlus,
  Heart,
  Baby,
  User,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatCard } from "@/components/shared/stat-card";

interface FamilyMember {
  id: string;
  name: string;
  initials: string;
  relationship: string;
  age: number;
  lastVisit: string;
  upcomingAppointments: number;
  avatarColor: string;
}

interface FamilyAppointment {
  id: string;
  member: string;
  doctor: string;
  dateTime: string;
  clinic: string;
}

const familyMembers: FamilyMember[] = [
  {
    id: "fm-1",
    name: "Meera Singh",
    initials: "MS",
    relationship: "Spouse",
    age: 34,
    lastVisit: "2026-02-28",
    upcomingAppointments: 1,
    avatarColor: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  },
  {
    id: "fm-2",
    name: "Arjun Singh",
    initials: "AS",
    relationship: "Son",
    age: 8,
    lastVisit: "2026-03-05",
    upcomingAppointments: 2,
    avatarColor: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  {
    id: "fm-3",
    name: "Ananya Singh",
    initials: "AS",
    relationship: "Daughter",
    age: 5,
    lastVisit: "2026-03-10",
    upcomingAppointments: 0,
    avatarColor: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  },
  {
    id: "fm-4",
    name: "Rajendra Singh",
    initials: "RS",
    relationship: "Father",
    age: 65,
    lastVisit: "2026-02-15",
    upcomingAppointments: 3,
    avatarColor: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
];

const familyAppointments: FamilyAppointment[] = [
  {
    id: "fa-1",
    member: "Meera Singh",
    doctor: "Dr. Priya Sharma",
    dateTime: "2026-03-15 10:00 AM",
    clinic: "CliniqAI Health Center",
  },
  {
    id: "fa-2",
    member: "Arjun Singh",
    doctor: "Dr. Anita Desai",
    dateTime: "2026-03-16 11:30 AM",
    clinic: "CliniqAI Kids Clinic",
  },
  {
    id: "fa-3",
    member: "Arjun Singh",
    doctor: "Dr. Rohit Mehta",
    dateTime: "2026-03-20 03:00 PM",
    clinic: "CliniqAI Health Center",
  },
  {
    id: "fa-4",
    member: "Rajendra Singh",
    doctor: "Dr. Sunil Verma",
    dateTime: "2026-03-14 09:30 AM",
    clinic: "CliniqAI Cardiology",
  },
  {
    id: "fa-5",
    member: "Rajendra Singh",
    doctor: "Dr. Priya Sharma",
    dateTime: "2026-03-18 02:00 PM",
    clinic: "CliniqAI Health Center",
  },
  {
    id: "fa-6",
    member: "Rajendra Singh",
    doctor: "Dr. Kavita Rao",
    dateTime: "2026-03-22 10:30 AM",
    clinic: "CliniqAI Ortho Clinic",
  },
];

const relationshipIcons: Record<string, React.ElementType> = {
  Spouse: Heart,
  Son: Baby,
  Daughter: Baby,
  Father: User,
  Mother: User,
  Parent: User,
};

export default function FamilyPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [relationship, setRelationship] = useState<string | null>("");

  const totalMembers = familyMembers.length;
  const totalUpcoming = familyMembers.reduce((sum, m) => sum + m.upcomingAppointments, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight section-header">Family Health Hub</h1>
          <p className="text-muted-foreground">Manage family members and their health under one account</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button className="cursor-pointer w-fit">
                <UserPlus className="h-4 w-4 mr-1.5" />
                Add Family Member
              </Button>
            }
          />
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Family Member</DialogTitle>
              <DialogDescription>
                Add a family member to manage their health records and appointments from your account.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="member-name">Full Name</Label>
                <Input id="member-name" placeholder="Enter full name" />
              </div>
              <div className="grid gap-2">
                <Label>Relationship</Label>
                <Select value={relationship} onValueChange={setRelationship}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spouse">Spouse</SelectItem>
                    <SelectItem value="son">Son</SelectItem>
                    <SelectItem value="daughter">Daughter</SelectItem>
                    <SelectItem value="father">Father</SelectItem>
                    <SelectItem value="mother">Mother</SelectItem>
                    <SelectItem value="sibling">Sibling</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="member-dob">Date of Birth</Label>
                <Input id="member-dob" type="date" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="member-phone">Phone Number</Label>
                <Input id="member-phone" placeholder="+91 98765 43210" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="member-id">Aadhaar / ID (Optional)</Label>
                <Input id="member-id" placeholder="Enter Aadhaar or ID number" />
              </div>
            </div>
            <DialogFooter>
              <Button className="cursor-pointer" onClick={() => setDialogOpen(false)}>
                <UserPlus className="h-4 w-4 mr-1.5" />
                Add Member
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Family Members"
          value={totalMembers}
          icon={Users}
          color="primary"
          delay={0}
        />
        <StatCard
          title="Upcoming Appointments"
          value={totalUpcoming}
          icon={CalendarDays}
          color="accent"
          delay={100}
        />
        <StatCard
          title="This Month Visits"
          value={3}
          icon={Stethoscope}
          color="emerald"
          delay={200}
        />
        <StatCard
          title="Active Prescriptions"
          value={7}
          icon={FileText}
          color="violet"
          delay={300}
        />
      </div>

      {/* Family Member Cards */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Family Members</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {familyMembers.map((member) => {
            const RelIcon = relationshipIcons[member.relationship] || User;
            return (
              <Card key={member.id} className="animate-fade-in-up">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12 text-base">
                      <AvatarFallback className={member.avatarColor}>
                        {member.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{member.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          <RelIcon className="h-3 w-3 mr-1" />
                          {member.relationship}
                        </Badge>
                        <span className="text-xs text-muted-foreground">Age {member.age}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <CalendarDays className="h-3.5 w-3.5" />
                      <span>
                        Last visit:{" "}
                        {new Date(member.lastVisit).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-sm">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">Upcoming:</span>
                    <Badge
                      variant="secondary"
                      className={
                        member.upcomingAppointments > 0
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : ""
                      }
                    >
                      {member.upcomingAppointments} appointment{member.upcomingAppointments !== 1 ? "s" : ""}
                    </Badge>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Button variant="outline" size="sm" className="cursor-pointer flex-1">
                      <FileText className="h-3.5 w-3.5 mr-1.5" />
                      View Records
                    </Button>
                    <Button size="sm" className="cursor-pointer flex-1">
                      <CalendarPlus className="h-3.5 w-3.5 mr-1.5" />
                      Book Appointment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Family Appointments */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Family Appointments</h2>
        <Card className="animate-fade-in-up">
          <CardContent className="p-0">
            <div className="divide-y">
              {familyAppointments
                .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
                .map((apt) => (
                  <div key={apt.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                    <div className="flex items-center gap-3 min-w-[180px]">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 shrink-0">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{apt.member}</p>
                        <p className="text-xs text-muted-foreground">{apt.doctor}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground ml-auto">
                      <span className="flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {apt.dateTime}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        {apt.clinic}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
