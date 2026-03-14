"use client";

import { useState } from "react";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Heart,
  Shield,
  Bell,
  Building2,
  AlertTriangle,
  Save,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { patientProfile } from "@/lib/mock-data";

export default function ProfilePage() {
  const [profile, setProfile] = useState(patientProfile);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight section-header">My Profile</h1>
        <p className="text-muted-foreground">Manage your personal and medical information</p>
      </div>

      {/* Profile Header */}
      <Card className="animate-fade-in-up">
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <Avatar className="h-20 w-20 text-2xl">
              <AvatarFallback>VS</AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl font-bold">{profile.name}</h2>
              <p className="text-muted-foreground">{profile.email}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2 justify-center sm:justify-start">
                <Badge variant="secondary">{profile.gender}</Badge>
                <Badge variant="secondary">Blood: {profile.bloodType}</Badge>
                <Badge variant="secondary">DOB: {profile.dateOfBirth}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Personal Info */}
        <Card className="animate-fade-in-up delay-100">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={profile.email} onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" value={profile.address} onChange={(e) => setProfile((p) => ({ ...p, address: e.target.value }))} />
            </div>
            <Button className="cursor-pointer w-fit">
              <Save className="h-4 w-4 mr-1.5" />
              Save Changes
            </Button>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card className="animate-fade-in-up delay-200">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4 text-destructive" />
              Emergency Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Contact Name</Label>
              <Input value={profile.emergencyContact.name} readOnly />
            </div>
            <div className="grid gap-2">
              <Label>Relationship</Label>
              <Input value={profile.emergencyContact.relation} readOnly />
            </div>
            <div className="grid gap-2">
              <Label>Phone</Label>
              <Input value={profile.emergencyContact.phone} readOnly />
            </div>
          </CardContent>
        </Card>

        {/* Medical Info */}
        <Card className="animate-fade-in-up delay-300">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Heart className="h-4 w-4 text-primary" />
              Medical Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Blood Type</Label>
              <p className="font-medium mt-1">{profile.bloodType}</p>
            </div>
            <Separator />
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Allergies
              </Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {profile.allergies.map((a) => (
                  <Badge key={a} variant="secondary" className="bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400">
                    {a}
                  </Badge>
                ))}
              </div>
            </div>
            <Separator />
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Chronic Conditions</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {profile.conditions.map((c) => (
                  <Badge key={c} variant="secondary">{c}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Communication Preferences */}
        <Card className="animate-fade-in-up delay-400">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              Communication Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">SMS Notifications</p>
                <p className="text-xs text-muted-foreground">Appointment reminders and updates</p>
              </div>
              <Switch checked={profile.communicationPrefs.sms} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Email Notifications</p>
                <p className="text-xs text-muted-foreground">Invoices, reports, and summaries</p>
              </div>
              <Switch checked={profile.communicationPrefs.email} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">AI Follow-up Calls</p>
                <p className="text-xs text-muted-foreground">Automated check-in calls after visits</p>
              </div>
              <Switch checked={profile.communicationPrefs.aiCalls} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">WhatsApp</p>
                <p className="text-xs text-muted-foreground">Quick updates and chat support</p>
              </div>
              <Switch checked={profile.communicationPrefs.whatsapp} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Linked Clinics */}
      <Card className="animate-fade-in-up delay-500">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            Linked Clinics
          </CardTitle>
          <CardDescription>Clinics you&apos;re registered with</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {profile.linkedClinics.map((clinic) => (
              <div key={clinic.name} className="rounded-lg bg-muted/50 p-4 flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shrink-0">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">{clinic.name}</p>
                  <p className="text-xs text-muted-foreground">{clinic.doctor}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Calendar className="h-3 w-3" />
                    Since {clinic.since}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
