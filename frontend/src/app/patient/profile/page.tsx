"use client";

import { useState, useEffect } from "react";
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
import { Spinner } from "@/components/shared/spinner";
import { users, patients } from "@/lib/api";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [profileRes, patientRes] = await Promise.all([
          users.getProfile(),
          patients.getMe(),
        ]);
        const merged = { ...(patientRes as any), ...(profileRes as any) };
        setProfile(merged);
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  async function handleSave() {
    if (!profile) return;
    setSaving(true);
    try {
      await users.updateProfile({
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        address: profile.address,
      });
    } catch (err) {
      console.error("Failed to save profile:", err);
    } finally {
      setSaving(false);
    }
  }

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  const initials = (profile.name || "")
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const allergies = profile.allergies || [];
  const conditions = profile.conditions || [];
  const emergencyContact = profile.emergencyContact || profile.emergency_contact || {};
  const communicationPrefs = profile.communicationPrefs || profile.communication_prefs || {};
  const linkedClinics = profile.linkedClinics || profile.linked_clinics || [];

  return (
    <div className="space-y-6">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/patient">Dashboard</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>Profile</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div>
        <h1 className="text-2xl font-bold tracking-tight section-header">My Profile</h1>
        <p className="text-muted-foreground">Manage your personal and medical information</p>
      </div>

      {/* Profile Header */}
      <Card className="animate-fade-in-up">
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <Avatar className="h-20 w-20 text-2xl">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl font-bold">{profile.name}</h2>
              <p className="text-muted-foreground">{profile.email}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2 justify-center sm:justify-start">
                {profile.gender && <Badge variant="secondary">{profile.gender}</Badge>}
                {(profile.bloodType || profile.blood_type) && (
                  <Badge variant="secondary">Blood: {profile.bloodType || profile.blood_type}</Badge>
                )}
                {(profile.dateOfBirth || profile.date_of_birth) && (
                  <Badge variant="secondary">DOB: {profile.dateOfBirth || profile.date_of_birth}</Badge>
                )}
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
              <Input id="name" value={profile.name || ""} onChange={(e) => setProfile((p: any) => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={profile.email || ""} onChange={(e) => setProfile((p: any) => ({ ...p, email: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={profile.phone || ""} onChange={(e) => setProfile((p: any) => ({ ...p, phone: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" value={profile.address || ""} onChange={(e) => setProfile((p: any) => ({ ...p, address: e.target.value }))} />
            </div>
            <Button className="cursor-pointer w-fit" onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-1.5" />
              {saving ? "Saving..." : "Save Changes"}
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
              <Input value={emergencyContact.name || ""} readOnly />
            </div>
            <div className="grid gap-2">
              <Label>Relationship</Label>
              <Input value={emergencyContact.relation || emergencyContact.relationship || ""} readOnly />
            </div>
            <div className="grid gap-2">
              <Label>Phone</Label>
              <Input value={emergencyContact.phone || ""} readOnly />
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
              <p className="font-medium mt-1">{profile.bloodType || profile.blood_type || "N/A"}</p>
            </div>
            <Separator />
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Allergies
              </Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {allergies.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No known allergies</p>
                ) : (
                  allergies.map((a: string) => (
                    <Badge key={a} variant="secondary" className="bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400">
                      {a}
                    </Badge>
                  ))
                )}
              </div>
            </div>
            <Separator />
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Chronic Conditions</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {conditions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">None</p>
                ) : (
                  conditions.map((c: string) => (
                    <Badge key={c} variant="secondary">{c}</Badge>
                  ))
                )}
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
              <Switch checked={communicationPrefs.sms || false} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Email Notifications</p>
                <p className="text-xs text-muted-foreground">Invoices, reports, and summaries</p>
              </div>
              <Switch checked={communicationPrefs.email || false} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">AI Follow-up Calls</p>
                <p className="text-xs text-muted-foreground">Automated check-in calls after visits</p>
              </div>
              <Switch checked={communicationPrefs.aiCalls || communicationPrefs.ai_calls || false} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">WhatsApp</p>
                <p className="text-xs text-muted-foreground">Quick updates and chat support</p>
              </div>
              <Switch checked={communicationPrefs.whatsapp || false} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Linked Clinics */}
      {linkedClinics.length > 0 && (
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
              {linkedClinics.map((clinic: any) => (
                <div key={clinic.name || clinic.id} className="rounded-lg bg-muted/50 p-4 flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shrink-0">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{clinic.name}</p>
                    <p className="text-xs text-muted-foreground">{clinic.doctor || clinic.doctor_name}</p>
                    {(clinic.since || clinic.joined_at) && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Calendar className="h-3 w-3" />
                        Since {clinic.since || clinic.joined_at}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
