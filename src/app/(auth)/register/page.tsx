"use client";

import { useState, useMemo } from "react";
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
  Lock,
  Sparkles,
  Bot,
  Shield,
  Eye,
  EyeOff,
  Loader2,
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
  color: string;
  bgColor: string;
}[] = [
  {
    value: "doctor",
    label: "Doctor / Clinic Owner",
    subtitle: "Create and manage your clinic",
    icon: Stethoscope,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    value: "staff",
    label: "Clinic Staff",
    subtitle: "Join an existing clinic team",
    icon: Users,
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    value: "patient",
    label: "Patient",
    subtitle: "Book appointments and manage health",
    icon: Heart,
    color: "text-chart-4",
    bgColor: "bg-chart-4/10",
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

const features = [
  { icon: Bot, text: "AI-powered voice receptionist" },
  { icon: Calendar, text: "Smart appointment scheduling" },
  { icon: Sparkles, text: "Automated patient follow-ups" },
];

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: "Weak", color: "bg-destructive" };
  if (score === 2) return { score, label: "Fair", color: "bg-amber-500" };
  if (score === 3) return { score, label: "Good", color: "bg-primary" };
  return { score, label: "Strong", color: "bg-emerald-500" };
}

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData | "terms", string>>>({});

  const passwordStrength = useMemo(
    () => getPasswordStrength(formData.password),
    [formData.password],
  );

  function updateField(field: keyof FormData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function handleSelectType(type: AccountType) {
    setAccountType(type);
    setStep(1);
  }

  function validate(): boolean {
    const newErrors: Partial<Record<keyof FormData | "terms", string>> = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (accountType === "doctor") {
      if (!formData.specialization.trim()) newErrors.specialization = "Specialization is required";
      if (!formData.clinicName.trim()) newErrors.clinicName = "Clinic name is required";
    }
    if (accountType === "staff" && !formData.clinicCode.trim()) {
      newErrors.clinicCode = "Clinic code is required";
    }
    if (accountType === "patient" && !formData.dateOfBirth.trim()) {
      newErrors.dateOfBirth = "Date of birth is required";
    }
    if (!agreedToTerms) {
      newErrors.terms = "You must agree to the Terms and Privacy Policy";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmitForm(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsLoading(false);
    setStep(2);
  }

  function handleGoToDashboard() {
    if (accountType) {
      router.push(dashboardRedirects[accountType]);
    }
  }

  function renderFieldError(field: keyof FormData | "terms") {
    if (!errors[field]) return null;
    return (
      <p className="text-xs text-destructive" role="alert">
        {errors[field]}
      </p>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Gradient base */}
        <div className="absolute inset-0 gradient-primary" />

        {/* Dot pattern overlay */}
        <div className="absolute inset-0 dot-pattern opacity-40" />

        {/* Decorative floating shapes */}
        <div
          className="absolute -top-20 -left-20 h-72 w-72 rounded-full opacity-20 animate-float"
          style={{ background: "radial-gradient(circle, oklch(0.64 0.18 262 / 0.5), transparent 70%)" }}
        />
        <div
          className="absolute top-1/3 -right-16 h-56 w-56 rounded-full opacity-15 animate-float"
          style={{ background: "radial-gradient(circle, oklch(0.58 0.155 170 / 0.6), transparent 70%)", animationDelay: "2s" }}
        />
        <div
          className="absolute bottom-20 left-1/4 h-40 w-40 rounded-full opacity-10 animate-float"
          style={{ background: "radial-gradient(circle, oklch(0.72 0.14 200 / 0.5), transparent 70%)", animationDelay: "4s" }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">CliniqAI</h1>
            <p className="mt-1 text-white/70 text-sm">
              AI-Powered Clinic Management
            </p>
          </div>

          <div className="max-w-md space-y-8">
            <div>
              <h2 className="text-3xl font-semibold leading-snug tracking-tight">
                Join thousands of healthcare professionals on CliniqAI
              </h2>
              <p className="mt-4 text-white/50 leading-relaxed">
                Whether you are a doctor, clinic staff, or patient, CliniqAI
                provides the tools you need for a seamless healthcare experience.
              </p>
            </div>

            {/* Feature bullets */}
            <div className="space-y-4">
              {features.map((feature) => (
                <div key={feature.text} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
                    <feature.icon className="h-4 w-4 text-white/90" />
                  </div>
                  <span className="text-sm text-white/80">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-sm text-white/40">
            CliniqAI v0.1.0
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="relative flex flex-1 flex-col items-center justify-center bg-background px-6 py-12">
        <div className="absolute right-4 top-4">
          <ThemeToggle />
        </div>

        {/* Mobile branding */}
        <div className="mb-10 text-center lg:hidden">
          <h1 className="text-2xl font-bold text-gradient-primary">CliniqAI</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            AI-Powered Clinic Management
          </p>
        </div>

        {/* Step indicator */}
        <div className="mb-8 flex w-full max-w-[440px] items-center justify-center gap-3">
          {steps.map((label, i) => (
            <div key={label} className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300 ${
                    i < step
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : i === step
                        ? "bg-primary text-primary-foreground shadow-sm ring-4 ring-primary/15"
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
                  className={`text-xs font-medium transition-colors ${
                    i <= step ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`h-px w-10 sm:w-14 transition-colors duration-300 ${
                    i < step ? "bg-primary" : "bg-border"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 0: Account type selection */}
        {step === 0 && (
          <Card className="w-full max-w-[440px] border-border/60 shadow-lg">
            <CardHeader className="text-center pb-2 pt-8">
              <CardTitle className="text-2xl font-semibold tracking-tight">
                Create your account
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Select your account type to get started
              </p>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 px-8 pb-8">
              {accountTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleSelectType(type.value)}
                  className="group flex items-center gap-4 rounded-xl border-2 border-border/60 bg-background p-5 text-left transition-all duration-200 hover:border-primary/40 hover:bg-primary/4 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  <div className={`flex h-13 w-13 shrink-0 items-center justify-center rounded-xl ${type.bgColor} transition-transform duration-200 group-hover:scale-105`}>
                    <type.icon className={`h-6 w-6 ${type.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      {type.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {type.subtitle}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground/50 transition-all duration-200 group-hover:text-primary group-hover:translate-x-0.5" />
                </button>
              ))}

              <p className="mt-6 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </CardContent>
          </Card>
        )}

        {/* Step 1: Registration form */}
        {step === 1 && accountType && (
          <Card className="w-full max-w-[440px] border-border/60 shadow-lg">
            <CardHeader className="pb-2 pt-7 px-8">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground hover:border-border focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <div>
                  <CardTitle className="text-xl font-semibold tracking-tight">
                    {accountType === "doctor" && "Doctor Registration"}
                    {accountType === "staff" && "Staff Registration"}
                    {accountType === "patient" && "Patient Registration"}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Fill in your details to create your account
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <form onSubmit={handleSubmitForm} className="flex flex-col gap-5" noValidate>
                {/* Full name */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="fullName" className="text-sm font-medium">
                    Full name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Dr. Jane Smith"
                      value={formData.fullName}
                      onChange={(e) => updateField("fullName", e.target.value)}
                      className={`pl-10 h-11 transition-shadow focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-0 ${
                        errors.fullName ? "border-destructive" : ""
                      }`}
                    />
                  </div>
                  {renderFieldError("fullName")}
                </div>

                {/* Email */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="regEmail" className="text-sm font-medium">
                    Email address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="regEmail"
                      type="email"
                      placeholder="jane@clinic.com"
                      value={formData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      className={`pl-10 h-11 transition-shadow focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-0 ${
                        errors.email ? "border-destructive" : ""
                      }`}
                    />
                  </div>
                  {renderFieldError("email")}
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Phone number
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      className={`pl-10 h-11 transition-shadow focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-0 ${
                        errors.phone ? "border-destructive" : ""
                      }`}
                    />
                  </div>
                  {renderFieldError("phone")}
                </div>

                {/* Doctor-specific fields */}
                {accountType === "doctor" && (
                  <>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="specialization" className="text-sm font-medium">
                        Specialization
                      </Label>
                      <div className="relative">
                        <Stethoscope className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="specialization"
                          type="text"
                          placeholder="General Practice, Cardiology, etc."
                          value={formData.specialization}
                          onChange={(e) => updateField("specialization", e.target.value)}
                          className={`pl-10 h-11 transition-shadow focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-0 ${
                            errors.specialization ? "border-destructive" : ""
                          }`}
                        />
                      </div>
                      {renderFieldError("specialization")}
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="clinicName" className="text-sm font-medium">
                        Clinic name
                      </Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="clinicName"
                          type="text"
                          placeholder="Smith Family Clinic"
                          value={formData.clinicName}
                          onChange={(e) => updateField("clinicName", e.target.value)}
                          className={`pl-10 h-11 transition-shadow focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-0 ${
                            errors.clinicName ? "border-destructive" : ""
                          }`}
                        />
                      </div>
                      {renderFieldError("clinicName")}
                    </div>
                  </>
                )}

                {/* Staff-specific fields */}
                {accountType === "staff" && (
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="clinicCode" className="text-sm font-medium">
                      Clinic code
                    </Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="clinicCode"
                        type="text"
                        placeholder="Enter your clinic invitation code"
                        value={formData.clinicCode}
                        onChange={(e) => updateField("clinicCode", e.target.value)}
                        className={`pl-10 h-11 transition-shadow focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-0 ${
                          errors.clinicCode ? "border-destructive" : ""
                        }`}
                      />
                    </div>
                    {renderFieldError("clinicCode")}
                  </div>
                )}

                {/* Patient-specific fields */}
                {accountType === "patient" && (
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="dateOfBirth" className="text-sm font-medium">
                      Date of birth
                    </Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => updateField("dateOfBirth", e.target.value)}
                        className={`pl-10 h-11 transition-shadow focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-0 ${
                          errors.dateOfBirth ? "border-destructive" : ""
                        }`}
                      />
                    </div>
                    {renderFieldError("dateOfBirth")}
                  </div>
                )}

                {/* Password with strength indicator */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="regPassword" className="text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="regPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={(e) => updateField("password", e.target.value)}
                      className={`pl-10 pr-10 h-11 transition-shadow focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-0 ${
                        errors.password ? "border-destructive" : ""
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {renderFieldError("password")}

                  {/* Password strength bar */}
                  {formData.password.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((level) => (
                          <div
                            key={level}
                            className={`h-1.5 flex-1 rounded-full transition-colors ${
                              level <= passwordStrength.score
                                ? passwordStrength.color
                                : "bg-muted"
                            }`}
                          />
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          {passwordStrength.label}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          8+ chars, uppercase, number, symbol
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Terms of Service checkbox */}
                <div className="flex flex-col gap-1.5">
                  <label className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => {
                        setAgreedToTerms(e.target.checked);
                        if (errors.terms) setErrors((prev) => ({ ...prev, terms: undefined }));
                      }}
                      className="mt-0.5 h-4 w-4 rounded border-border accent-primary"
                    />
                    <span>
                      I agree to the{" "}
                      <Link href="#" className="text-primary hover:text-primary/80 font-medium underline underline-offset-2">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="#" className="text-primary hover:text-primary/80 font-medium underline underline-offset-2">
                        Privacy Policy
                      </Link>
                    </span>
                  </label>
                  {renderFieldError("terms")}
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="mt-1 w-full h-12 text-sm font-semibold tracking-wide"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              <p className="mt-8 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Success */}
        {step === 2 && accountType && (
          <Card className="w-full max-w-[440px] border-border/60 shadow-lg">
            <CardContent className="flex flex-col items-center gap-6 px-8 pt-10 pb-10 text-center">
              <div className="relative">
                <div
                  className="absolute inset-0 rounded-full blur-xl opacity-30"
                  style={{ background: "linear-gradient(135deg, oklch(0.58 0.155 170), oklch(0.46 0.20 264))" }}
                />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full"
                  style={{ background: "linear-gradient(135deg, oklch(0.58 0.155 170 / 0.15), oklch(0.46 0.20 264 / 0.15))" }}
                >
                  <CheckCircle2 className="h-10 w-10 text-accent" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-foreground tracking-tight">
                  Account Created
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                  Welcome to CliniqAI, {formData.fullName || "there"}! Your{" "}
                  {accountType === "doctor"
                    ? "doctor"
                    : accountType === "staff"
                      ? "staff"
                      : "patient"}{" "}
                  account is ready. Please check your email to verify your account.
                </p>
              </div>

              {/* Quick highlights */}
              <div className="w-full rounded-xl bg-muted/50 p-4 space-y-2.5">
                <div className="flex items-center gap-2.5 text-left">
                  <Shield className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-xs text-muted-foreground">Secure, encrypted healthcare data</span>
                </div>
                <div className="flex items-center gap-2.5 text-left">
                  <Sparkles className="h-4 w-4 text-accent shrink-0" />
                  <span className="text-xs text-muted-foreground">AI-powered tools ready to use</span>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full h-12 text-sm font-semibold tracking-wide"
                onClick={handleGoToDashboard}
              >
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Link
                href="/"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Back to home
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Footer note */}
        <p className="mt-8 text-xs text-muted-foreground/60 text-center max-w-sm">
          Protected by enterprise-grade security. Your healthcare data is encrypted and HIPAA-compliant.
        </p>
      </div>
    </div>
  );
}
