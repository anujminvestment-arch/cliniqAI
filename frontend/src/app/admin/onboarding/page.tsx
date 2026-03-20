"use client";

import { useState } from "react";
import {
  Building2, UserRound, Stethoscope, MapPin, BookOpen,
  ArrowRight, ArrowLeft, Check, Plus, Trash2, Copy, CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/shared/spinner";
import {
  Breadcrumb, BreadcrumbList, BreadcrumbItem,
  BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage,
} from "@/components/ui/breadcrumb";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const SPECIALIZATIONS = [
  "General Physician", "Dentist", "Dermatologist", "Orthopedic",
  "Pediatrician", "Gynecologist", "ENT Specialist", "Ophthalmologist",
  "Cardiologist", "Gastroenterologist", "Neurologist", "Psychiatrist",
  "Urologist", "Pulmonologist", "Endocrinologist", "Oncologist",
];

const STEPS = [
  { number: 1, label: "Clinic Details", icon: Building2 },
  { number: 2, label: "Admin Account", icon: UserRound },
  { number: 3, label: "Doctors", icon: Stethoscope },
  { number: 4, label: "Branches", icon: MapPin },
  { number: 5, label: "Knowledge Base", icon: BookOpen },
  { number: 6, label: "Review & Submit", icon: Check },
];

const DEFAULT_TIMINGS: Record<string, { open: string; close: string }> = {
  mon: { open: "09:00", close: "18:00" },
  tue: { open: "09:00", close: "18:00" },
  wed: { open: "09:00", close: "18:00" },
  thu: { open: "09:00", close: "18:00" },
  fri: { open: "09:00", close: "18:00" },
  sat: { open: "09:00", close: "14:00" },
};

type DoctorForm = {
  name: string; specialization: string; qualification: string;
  experience_years: number; phone: string; email: string; consultation_fee: number;
};

type BranchForm = {
  name: string; address: string; city: string; state: string;
  pincode: string; phone: string; timings: Record<string, { open: string; close: string }>;
};

type KBForm = { category: string; title: string; content: string; tags: string };

export default function ClinicOnboardingPage() {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  // Step 1: Clinic
  const [clinic, setClinic] = useState({
    name: "", slug: "", phone: "", email: "", address: "",
    city: "", state: "", pincode: "",
    timings: { ...DEFAULT_TIMINGS },
    amenities: "",
    services: "",
  });

  // Step 2: Admin
  const [admin, setAdmin] = useState({ name: "", email: "", phone: "", password: "auto" });

  // Step 3: Doctors
  const [doctors, setDoctors] = useState<DoctorForm[]>([{
    name: "", specialization: "General Physician", qualification: "",
    experience_years: 5, phone: "", email: "", consultation_fee: 500,
  }]);

  // Step 4: Branches
  const [branches, setBranches] = useState<BranchForm[]>([]);

  // Step 5: Knowledge Base
  const [kbEntries, setKbEntries] = useState<KBForm[]>([]);

  // Auto-generate slug from name
  function updateClinicName(name: string) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "");
    setClinic({ ...clinic, name, slug });
  }

  function addDoctor() {
    setDoctors([...doctors, {
      name: "", specialization: "General Physician", qualification: "",
      experience_years: 5, phone: "", email: "", consultation_fee: 500,
    }]);
  }

  function removeDoctor(i: number) { setDoctors(doctors.filter((_, idx) => idx !== i)); }

  function updateDoctor(i: number, field: string, value: any) {
    const updated = [...doctors];
    (updated[i] as any)[field] = value;
    setDoctors(updated);
  }

  function addBranch() {
    setBranches([...branches, {
      name: "", address: "", city: "", state: "", pincode: "", phone: "",
      timings: { ...DEFAULT_TIMINGS },
    }]);
  }

  function removeBranch(i: number) { setBranches(branches.filter((_, idx) => idx !== i)); }

  function addKB() {
    setKbEntries([...kbEntries, { category: "clinic_info", title: "", content: "", tags: "" }]);
  }

  function removeKB(i: number) { setKbEntries(kbEntries.filter((_, idx) => idx !== i)); }

  async function handleSubmit() {
    setSubmitting(true);
    setError("");
    try {
      const token = localStorage.getItem("access_token");
      const payload = {
        clinic: {
          ...clinic,
          amenities: clinic.amenities ? clinic.amenities.split(",").map(s => s.trim()).filter(Boolean) : [],
          services: clinic.services ? clinic.services.split(",").map(s => s.trim()).filter(Boolean) : [],
          settings: { aiVoiceEnabled: true, language: "hi", avgConsultationMinutes: 15 },
        },
        admin,
        doctors: doctors.filter(d => d.name),
        branches: branches.filter(b => b.name),
        knowledge_base: kbEntries.filter(k => k.title && k.content).map(k => ({
          ...k, tags: k.tags ? k.tags.split(",").map(s => s.trim()).filter(Boolean) : [],
        })),
      };

      const res = await fetch(`${API_BASE}/api/admin/onboard-clinic`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Onboarding failed");
      }

      const data = await res.json();
      setResult(data);
      setStep(7); // Success step
    } catch (err: any) {
      setError(err.message || "Failed to onboard clinic");
    } finally {
      setSubmitting(false);
    }
  }

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 2000);
  }

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>Onboard New Clinic</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Clinic Onboarding</h1>
        <p className="text-muted-foreground mt-1">Register a new clinic with doctors, branches, and knowledge base.</p>
      </div>

      {/* Step Indicator */}
      {step <= 6 && (
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {STEPS.map((s, idx) => (
            <div key={s.number} className="flex items-center">
              <button
                onClick={() => setStep(s.number)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  step === s.number ? "bg-primary text-primary-foreground" :
                  step > s.number ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                }`}
              >
                {step > s.number ? <Check className="h-3 w-3" /> : <s.icon className="h-3 w-3" />}
                {s.label}
              </button>
              {idx < STEPS.length - 1 && <div className={`w-6 h-0.5 ${step > s.number ? "bg-primary" : "bg-muted"}`} />}
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">{error}</div>
      )}

      {/* ── STEP 1: Clinic Details ─────────────────────────── */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Clinic Details</CardTitle>
            <CardDescription>Basic information about the clinic</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Clinic Name *</Label>
                <Input value={clinic.name} onChange={e => updateClinicName(e.target.value)} placeholder="e.g. Apollo Multi-Specialty Clinic" />
              </div>
              <div className="space-y-1.5">
                <Label>Slug (URL) *</Label>
                <Input value={clinic.slug} onChange={e => setClinic({ ...clinic, slug: e.target.value })} placeholder="apollo-indiranagar" />
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input value={clinic.phone} onChange={e => setClinic({ ...clinic, phone: e.target.value })} placeholder="+91-80-XXXX-XXXX" />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input value={clinic.email} onChange={e => setClinic({ ...clinic, email: e.target.value })} placeholder="info@clinic.in" />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <Label>Address</Label>
                <Input value={clinic.address} onChange={e => setClinic({ ...clinic, address: e.target.value })} placeholder="Full address" />
              </div>
              <div className="space-y-1.5">
                <Label>City</Label>
                <Input value={clinic.city} onChange={e => setClinic({ ...clinic, city: e.target.value })} placeholder="Bangalore" />
              </div>
              <div className="space-y-1.5">
                <Label>State</Label>
                <Input value={clinic.state} onChange={e => setClinic({ ...clinic, state: e.target.value })} placeholder="Karnataka" />
              </div>
              <div className="space-y-1.5">
                <Label>Pincode</Label>
                <Input value={clinic.pincode} onChange={e => setClinic({ ...clinic, pincode: e.target.value })} placeholder="560038" />
              </div>
            </div>

            <Separator />
            <h3 className="font-medium text-sm">Timings</h3>
            <div className="grid gap-2">
              {DAYS.map(day => (
                <div key={day} className="flex items-center gap-3">
                  <span className="w-10 text-sm font-medium capitalize">{day}</span>
                  <Input
                    type="time" className="w-32"
                    value={clinic.timings[day]?.open || ""}
                    onChange={e => setClinic({
                      ...clinic,
                      timings: { ...clinic.timings, [day]: { ...clinic.timings[day], open: e.target.value } },
                    })}
                  />
                  <span className="text-muted-foreground">to</span>
                  <Input
                    type="time" className="w-32"
                    value={clinic.timings[day]?.close || ""}
                    onChange={e => setClinic({
                      ...clinic,
                      timings: { ...clinic.timings, [day]: { ...clinic.timings[day], close: e.target.value } },
                    })}
                  />
                </div>
              ))}
            </div>

            <Separator />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Services (comma-separated)</Label>
                <Input value={clinic.services} onChange={e => setClinic({ ...clinic, services: e.target.value })} placeholder="Dental, General Medicine, Dermatology" />
              </div>
              <div className="space-y-1.5">
                <Label>Amenities (comma-separated)</Label>
                <Input value={clinic.amenities} onChange={e => setClinic({ ...clinic, amenities: e.target.value })} placeholder="Parking, WiFi, AC, Lab, Pharmacy" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── STEP 2: Admin Account ──────────────────────────── */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Clinic Admin Account</CardTitle>
            <CardDescription>This person will manage the clinic dashboard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Admin Name *</Label>
                <Input value={admin.name} onChange={e => setAdmin({ ...admin, name: e.target.value })} placeholder="Dr. Admin Name" />
              </div>
              <div className="space-y-1.5">
                <Label>Email *</Label>
                <Input type="email" value={admin.email} onChange={e => setAdmin({ ...admin, email: e.target.value })} placeholder="admin@clinic.in" />
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input value={admin.phone} onChange={e => setAdmin({ ...admin, phone: e.target.value })} placeholder="+91 XXXXX XXXXX" />
              </div>
              <div className="space-y-1.5">
                <Label>Password</Label>
                <Input value={admin.password} onChange={e => setAdmin({ ...admin, password: e.target.value })} placeholder="auto = generate random" />
                <p className="text-xs text-muted-foreground">Type "auto" to generate a random password</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── STEP 3: Doctors ─────────────────────────────────── */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Doctors</h2>
              <p className="text-sm text-muted-foreground">Add doctors who will practice at this clinic</p>
            </div>
            <Button onClick={addDoctor} size="sm" className="gap-1.5"><Plus className="h-4 w-4" /> Add Doctor</Button>
          </div>

          {doctors.map((doc, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Doctor {i + 1}</CardTitle>
                  {doctors.length > 1 && (
                    <Button variant="ghost" size="icon-sm" onClick={() => removeDoctor(i)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Name *</Label>
                    <Input value={doc.name} onChange={e => updateDoctor(i, "name", e.target.value)} placeholder="Dr. Name" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Specialization</Label>
                    <select
                      className="w-full px-3 py-2 text-sm border rounded-lg bg-background"
                      value={doc.specialization}
                      onChange={e => updateDoctor(i, "specialization", e.target.value)}
                    >
                      {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Qualification</Label>
                    <Input value={doc.qualification} onChange={e => updateDoctor(i, "qualification", e.target.value)} placeholder="MBBS, MD" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Experience (years)</Label>
                    <Input type="number" value={doc.experience_years} onChange={e => updateDoctor(i, "experience_years", parseInt(e.target.value) || 0)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Email</Label>
                    <Input type="email" value={doc.email} onChange={e => updateDoctor(i, "email", e.target.value)} placeholder="doctor@clinic.in" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Phone</Label>
                    <Input value={doc.phone} onChange={e => updateDoctor(i, "phone", e.target.value)} placeholder="+91..." />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Consultation Fee (₹)</Label>
                    <Input type="number" value={doc.consultation_fee} onChange={e => updateDoctor(i, "consultation_fee", parseInt(e.target.value) || 0)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ── STEP 4: Branches ────────────────────────────────── */}
      {step === 4 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Branches (Optional)</h2>
              <p className="text-sm text-muted-foreground">Add additional clinic branches</p>
            </div>
            <Button onClick={addBranch} size="sm" className="gap-1.5"><Plus className="h-4 w-4" /> Add Branch</Button>
          </div>

          {branches.length === 0 && (
            <Card><CardContent className="py-8 text-center text-muted-foreground">No branches added. Click "Add Branch" or skip to next step.</CardContent></Card>
          )}

          {branches.map((br, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Branch {i + 1}</CardTitle>
                  <Button variant="ghost" size="icon-sm" onClick={() => removeBranch(i)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Branch Name *</Label>
                    <Input value={br.name} onChange={e => { const u = [...branches]; u[i].name = e.target.value; setBranches(u); }} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Phone</Label>
                    <Input value={br.phone} onChange={e => { const u = [...branches]; u[i].phone = e.target.value; setBranches(u); }} />
                  </div>
                  <div className="sm:col-span-2 space-y-1">
                    <Label className="text-xs">Address</Label>
                    <Input value={br.address} onChange={e => { const u = [...branches]; u[i].address = e.target.value; setBranches(u); }} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">City</Label>
                    <Input value={br.city} onChange={e => { const u = [...branches]; u[i].city = e.target.value; setBranches(u); }} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">State</Label>
                    <Input value={br.state} onChange={e => { const u = [...branches]; u[i].state = e.target.value; setBranches(u); }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ── STEP 5: Knowledge Base ──────────────────────────── */}
      {step === 5 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Knowledge Base (Optional)</h2>
              <p className="text-sm text-muted-foreground">Add custom FAQ/info. If empty, defaults will be auto-generated from clinic data.</p>
            </div>
            <Button onClick={addKB} size="sm" className="gap-1.5"><Plus className="h-4 w-4" /> Add Entry</Button>
          </div>

          {kbEntries.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center space-y-2">
                <p className="text-muted-foreground">No custom entries. The system will auto-generate:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {["Welcome greeting", "Timings", "Doctor profiles", "Services", "Location",
                    "Booking methods", "Queue system", "Payment methods", "Insurance", "Emergency"].map(t => (
                    <Badge key={t} variant="outline">{t}</Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">All entries stored as JSON + chunks + embeddings for AI search</p>
              </CardContent>
            </Card>
          )}

          {kbEntries.map((kb, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">KB Entry {i + 1}</CardTitle>
                  <Button variant="ghost" size="icon-sm" onClick={() => removeKB(i)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Category</Label>
                    <select
                      className="w-full px-3 py-2 text-sm border rounded-lg bg-background"
                      value={kb.category}
                      onChange={e => { const u = [...kbEntries]; u[i].category = e.target.value; setKbEntries(u); }}
                    >
                      {["clinic_info", "doctor_info", "services", "appointment", "queue", "billing", "faq", "emergency"].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Tags (comma-separated)</Label>
                    <Input value={kb.tags} onChange={e => { const u = [...kbEntries]; u[i].tags = e.target.value; setKbEntries(u); }} placeholder="timings, hours" />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Title *</Label>
                  <Input value={kb.title} onChange={e => { const u = [...kbEntries]; u[i].title = e.target.value; setKbEntries(u); }} placeholder="What are the clinic timings?" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Content *</Label>
                  <Textarea value={kb.content} onChange={e => { const u = [...kbEntries]; u[i].content = e.target.value; setKbEntries(u); }} rows={3} placeholder="Detailed answer..." />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ── STEP 6: Review ──────────────────────────────────── */}
      {step === 6 && (
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Review Before Submitting</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">Clinic</p>
                  <p className="font-medium">{clinic.name || "—"}</p>
                  <p className="text-sm text-muted-foreground">{clinic.address}, {clinic.city}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Admin</p>
                  <p className="font-medium">{admin.name || "—"}</p>
                  <p className="text-sm text-muted-foreground">{admin.email}</p>
                </div>
              </div>
              <Separator />
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">{doctors.filter(d => d.name).length}</p>
                  <p className="text-xs text-muted-foreground">Doctors</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">{branches.filter(b => b.name).length}</p>
                  <p className="text-xs text-muted-foreground">Branches</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">{kbEntries.filter(k => k.title).length || "Auto"}</p>
                  <p className="text-xs text-muted-foreground">KB Entries</p>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-xs text-muted-foreground mb-2">Services</p>
                <div className="flex flex-wrap gap-1.5">
                  {(clinic.services || "Not specified").split(",").map((s, i) => (
                    <Badge key={i} variant="outline">{s.trim()}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2">Doctors</p>
                {doctors.filter(d => d.name).map((d, i) => (
                  <div key={i} className="text-sm">
                    {d.name} — {d.specialization} — ₹{d.consultation_fee}
                  </div>
                ))}
              </div>
              <Separator />
              <p className="text-xs text-muted-foreground">
                Data will be stored as: JSON (raw) + Chunks (for search) + Embeddings (for AI semantic search via OpenAI).
                Symptom mappings auto-generated per doctor specialization.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── STEP 7: Success ─────────────────────────────────── */}
      {step === 7 && result && (
        <div className="space-y-4">
          <Card className="border-emerald-200 dark:border-emerald-800">
            <CardContent className="py-8 text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Clinic Onboarded Successfully!</h2>
                <p className="text-muted-foreground mt-1">{result.clinic_name} is now live on CliniqAI.</p>
              </div>
            </CardContent>
          </Card>

          {/* Credentials Card */}
          <Card>
            <CardHeader><CardTitle className="text-base">Admin Credentials</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-mono text-sm">{result.admin?.email}</p>
                </div>
                <Button variant="ghost" size="icon-sm" onClick={() => copyToClipboard(result.admin?.email, "email")}>
                  {copied === "email" ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Password</p>
                  <p className="font-mono text-sm">{result.admin?.password}</p>
                </div>
                <Button variant="ghost" size="icon-sm" onClick={() => copyToClipboard(result.admin?.password, "pass")}>
                  {copied === "pass" ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader><CardTitle className="text-base">Onboarding Summary</CardTitle></CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="text-2xl font-bold">{result.doctors_count}</p>
                  <p className="text-xs text-muted-foreground">Doctors</p>
                </div>
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="text-2xl font-bold">{result.branches_count}</p>
                  <p className="text-xs text-muted-foreground">Branches</p>
                </div>
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="text-2xl font-bold">{result.kb_count}</p>
                  <p className="text-xs text-muted-foreground">KB Entries</p>
                </div>
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="text-2xl font-bold">{result.symptom_mappings_count}</p>
                  <p className="text-xs text-muted-foreground">Symptom Maps</p>
                </div>
              </div>
              {result.embedding && (
                <div className="mt-3 text-xs text-muted-foreground">
                  Embeddings: {result.embedding.embedded} created, {result.embedding.skipped} skipped
                  {result.embedding.error && <span className="text-amber-500"> (warning: {result.embedding.error})</span>}
                </div>
              )}

              {/* Doctor Credentials */}
              {result.doctors?.filter((d: any) => d.is_new_user && d.password).length > 0 && (
                <>
                  <Separator className="my-3" />
                  <h4 className="text-sm font-medium mb-2">Doctor Login Credentials</h4>
                  {result.doctors.filter((d: any) => d.is_new_user).map((d: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-muted rounded text-xs mb-1">
                      <span>{d.name} — {d.email}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono">{d.password}</span>
                        <Button variant="ghost" size="icon-xs" onClick={() => copyToClipboard(`${d.email} / ${d.password}`, `doc-${i}`)}>
                          {copied === `doc-${i}` ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </CardContent>
          </Card>

          <Button onClick={() => { setStep(1); setResult(null); setError(""); }} variant="outline" className="gap-2">
            <Plus className="h-4 w-4" /> Onboard Another Clinic
          </Button>
        </div>
      )}

      {/* ── Navigation ──────────────────────────────────────── */}
      {step <= 6 && (
        <div className="flex items-center justify-between pt-4">
          <Button variant="outline" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1} className="gap-1.5">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          {step < 6 ? (
            <Button onClick={() => setStep(step + 1)} className="gap-1.5">
              Next <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={submitting || !clinic.name || !clinic.slug || !admin.email} className="gap-1.5">
              {submitting ? <><Spinner size="sm" /> Onboarding...</> : <>Submit & Onboard <Check className="h-4 w-4" /></>}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
