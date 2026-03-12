"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Stethoscope,
  Users,
  Heart,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Mail,
  Phone,
  User,
  Building2,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/shared/theme-toggle";

type AccountType = "doctor" | "staff" | "patient";

const accountTypes: {
  value: AccountType;
  label: string;
  subtitle: string;
  icon: typeof Stethoscope;
}[] = [
  {
    value: "doctor",
    label: "Doctor / Clinic Owner",
    subtitle: "Create and manage your clinic",
    icon: Stethoscope,
  },
  {
    value: "staff",
    label: "Clinic Staff",
    subtitle: "Join an existing clinic team",
    icon: Users,
  },
  {
    value: "patient",
    label: "Patient",
    subtitle: "Book appointments and manage health",
    icon: Heart,
  },
];

const dashboardRedirects: Record<AccountType, string> = {
  doctor: "/clinic",
  staff: "/clinic",
  patient: "/patient",
};

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  specialization: string;
  clinicName: string;
  clinicCode: string;
  dateOfBirth: string;
  password: string;
}

const initialFormData: FormData = {
  fullName: "",
  email: "",
  phone: "",
  specialization: "",
  clinicName: "",
  clinicCode: "",
  dateOfBirth: "",
  password: "",
};

const steps = ["Account Type", "Details", "Complete"];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);

  function updateField(field: keyof FormData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function handleSelectType(type: AccountType) {
    setAccountType(type);
    setStep(1);
  }

  function handleSubmitForm(e: React.FormEvent) {
    e.preventDefault();
    setStep(2);
  }

  function handleGoToDashboard() {
    if (accountType) {
      router.push(dashboardRedirects[accountType]);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left branding panel */}
      <div className="hidden flex-col justify-between bg-gradient-to-br from-primary to-primary/80 p-12 text-primary-foreground lg:flex lg:w-1/2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">CliniqAI</h1>
          <p className="mt-1 text-primary-foreground/80">
            AI-Powered Clinic Management
          </p>
        </div>
        <div className="max-w-md">
          <h2 className="text-2xl font-semibold leading-snug">
            Join thousands of healthcare professionals on CliniqAI
          </h2>
          <p className="mt-4 text-primary-foreground/70">
            Whether you are a doctor, clinic staff, or patient, CliniqAI
            provides the tools you need for a seamless healthcare experience.
          </p>
        </div>
        <p className="text-sm text-primary-foreground/50">
          CliniqAI v0.1.0
        </p>
      </div>

      {/* Right form panel */}
      <div className="relative flex flex-1 flex-col items-center justify-center bg-background px-4 py-8">
        <div className="absolute right-4 top-4">
          <ThemeToggle />
        </div>

        {/* Mobile branding */}
        <div className="mb-8 text-center lg:hidden">
          <h1 className="text-2xl font-bold text-primary">CliniqAI</h1>
          <p className="text-sm text-muted-foreground">
            AI-Powered Clinic Management
          </p>
        </div>

        {/* Step indicator */}
        <div className="mb-6 flex w-full max-w-md items-center justify-center gap-2">
          {steps.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                    i < step
                      ? "bg-primary text-primary-foreground"
                      : i === step
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {i < step ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    i + 1
                  )}
                </div>
                <span
                  className={`hidden text-xs font-medium sm:inline ${
                    i <= step ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`h-px w-8 sm:w-12 ${
                    i < step ? "bg-primary" : "bg-border"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 0: Account type selection */}
        {step === 0 && (
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Create your account</CardTitle>
              <p className="text-sm text-muted-foreground">
                Select your account type to get started
              </p>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {accountTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleSelectType(type.value)}
                  className="flex cursor-pointer items-center gap-4 rounded-lg border border-border bg-background p-4 text-left transition-all hover:border-primary/50 hover:bg-primary/5"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <type.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {type.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {type.subtitle}
                    </p>
                  </div>
                  <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
                </button>
              ))}

              <p className="mt-4 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-medium text-primary hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </CardContent>
          </Card>
        )}

        {/* Step 1: Registration form */}
        {step === 1 && accountType && (
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <div>
                  <CardTitle className="text-xl">
                    {accountType === "doctor" && "Doctor Registration"}
                    {accountType === "staff" && "Staff Registration"}
                    {accountType === "patient" && "Patient Registration"}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Fill in your details to create your account
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitForm} className="flex flex-col gap-4">
                {/* Full name — all types */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="fullName">Full name</Label>
                  <div className="relative">
                    <User className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Dr. Jane Smith"
                      value={formData.fullName}
                      onChange={(e) => updateField("fullName", e.target.value)}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>

                {/* Email — all types */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="regEmail">Email address</Label>
                  <div className="relative">
                    <Mail className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="regEmail"
                      type="email"
                      placeholder="jane@clinic.com"
                      value={formData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>

                {/* Phone — all types */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="phone">Phone number</Label>
                  <div className="relative">
                    <Phone className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>

                {/* Doctor-specific fields */}
                {accountType === "doctor" && (
                  <>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="specialization">Specialization</Label>
                      <div className="relative">
                        <Stethoscope className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="specialization"
                          type="text"
                          placeholder="General Practice, Cardiology, etc."
                          value={formData.specialization}
                          onChange={(e) =>
                            updateField("specialization", e.target.value)
                          }
                          className="pl-9"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="clinicName">Clinic name</Label>
                      <div className="relative">
                        <Building2 className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="clinicName"
                          type="text"
                          placeholder="Smith Family Clinic"
                          value={formData.clinicName}
                          onChange={(e) =>
                            updateField("clinicName", e.target.value)
                          }
                          className="pl-9"
                          required
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Staff-specific fields */}
                {accountType === "staff" && (
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="clinicCode">Clinic code</Label>
                    <div className="relative">
                      <Building2 className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="clinicCode"
                        type="text"
                        placeholder="Enter your clinic invitation code"
                        value={formData.clinicCode}
                        onChange={(e) =>
                          updateField("clinicCode", e.target.value)
                        }
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Patient-specific fields */}
                {accountType === "patient" && (
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="dateOfBirth">Date of birth</Label>
                    <div className="relative">
                      <Calendar className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) =>
                          updateField("dateOfBirth", e.target.value)
                        }
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Password — all types */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="regPassword">Password</Label>
                  <Input
                    id="regPassword"
                    type="password"
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="mt-1 w-full cursor-pointer"
                >
                  Create Account
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-medium text-primary hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Success */}
        {step === 2 && accountType && (
          <Card className="w-full max-w-md">
            <CardContent className="flex flex-col items-center gap-5 pt-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
                <CheckCircle2 className="h-8 w-8 text-accent" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  Account Created
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Welcome to CliniqAI, {formData.fullName || "there"}! Your{" "}
                  {accountType === "doctor"
                    ? "doctor"
                    : accountType === "staff"
                      ? "staff"
                      : "patient"}{" "}
                  account is ready.
                </p>
              </div>
              <Button
                size="lg"
                className="w-full cursor-pointer"
                onClick={handleGoToDashboard}
              >
                Go to Dashboard
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
              <Link
                href="/"
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Back to home
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
