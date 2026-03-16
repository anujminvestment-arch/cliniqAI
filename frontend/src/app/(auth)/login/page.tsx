"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  ArrowRight,
  Shield,
  Building2,
  UserCircle,
  Sparkles,
  Calendar,
  Bot,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/shared/theme-toggle";

type Role = "super-admin" | "clinic-admin" | "patient";

const roles: { value: Role; label: string; icon: typeof Shield; description: string }[] = [
  { value: "super-admin", label: "Super Admin", icon: Shield, description: "Platform management" },
  { value: "clinic-admin", label: "Clinic Admin", icon: Building2, description: "Clinic operations" },
  { value: "patient", label: "Patient", icon: UserCircle, description: "Health portal" },
];

const roleRedirects: Record<Role, string> = {
  "super-admin": "/admin",
  "clinic-admin": "/clinic",
  patient: "/patient",
};

const features = [
  { icon: Bot, text: "AI-powered voice receptionist" },
  { icon: Calendar, text: "Smart appointment scheduling" },
  { icon: Sparkles, text: "Automated patient follow-ups" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("clinic-admin");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [apiError, setApiError] = useState("");

  function validate(): boolean {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setApiError("");
    try {
      const { auth } = await import("@/lib/api");
      const data = await auth.login(email, password);
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      // Role-based redirect
      const roleMap: Record<string, string> = {
        super_admin: "/admin",
        clinic_owner: "/clinic",
        doctor: "/clinic",
        staff: "/clinic",
        nurse: "/clinic",
        receptionist: "/clinic",
        patient: "/patient",
      };
      router.push(roleMap[data.membership.role] || "/clinic");
    } catch (err: any) {
      setApiError(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
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
                Streamline your clinic operations with intelligent automation
              </h2>
              <p className="mt-4 text-white/50 leading-relaxed">
                Manage appointments, automate patient communication, and optimize
                your practice with AI-powered tools designed for modern healthcare.
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

        <Card className="w-full max-w-[440px] border-border/60 shadow-lg">
          <CardHeader className="text-center pb-2 pt-8">
            <CardTitle className="text-2xl font-semibold tracking-tight">
              Sign in to your account
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Select your role and enter your credentials
            </p>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
              {/* Role selector */}
              <div className="flex flex-col gap-3">
                <Label className="text-sm font-medium">Sign in as</Label>
                <div className="grid grid-cols-3 gap-3">
                  {roles.map((r) => {
                    const Icon = r.icon;
                    const isActive = role === r.value;
                    return (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setRole(r.value)}
                        className={`group relative flex flex-col items-center gap-2 rounded-xl border-2 px-3 py-4 text-center transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                          isActive
                            ? "border-primary bg-primary/8 shadow-sm"
                            : "border-border/60 bg-background hover:border-primary/40 hover:bg-primary/4"
                        }`}
                      >
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors duration-200 ${
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className={`text-xs font-semibold transition-colors ${
                            isActive ? "text-primary" : "text-foreground"
                          }`}>
                            {r.label}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
                            {r.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <Separator />

              {/* Email */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="doctor@clinic.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    className={`pl-10 h-11 transition-shadow focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-0 ${
                      errors.email ? "border-destructive focus-visible:ring-destructive/30" : ""
                    }`}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                  />
                </div>
                {errors.email && (
                  <p id="email-error" className="text-xs text-destructive" role="alert">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                    }}
                    className={`pl-10 pr-10 h-11 transition-shadow focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-0 ${
                      errors.password ? "border-destructive focus-visible:ring-destructive/30" : ""
                    }`}
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? "password-error" : undefined}
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
                {errors.password && (
                  <p id="password-error" className="text-xs text-destructive" role="alert">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Remember me + Forgot password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 rounded border-border accent-primary"
                  />
                  Remember me
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                size="lg"
                className="w-full h-12 text-sm font-semibold tracking-wide"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              {apiError && (
                <p className="text-sm text-destructive text-center" role="alert">{apiError}</p>
              )}
            </form>

            <div className="mt-8 flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">or</span>
              <Separator className="flex-1" />
            </div>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                Register
              </Link>
            </p>
          </CardContent>
        </Card>

        {/* Footer note */}
        <p className="mt-8 text-xs text-muted-foreground/60 text-center max-w-sm">
          Protected by enterprise-grade security. Your healthcare data is encrypted and HIPAA-compliant.
        </p>
      </div>
    </div>
  );
}
