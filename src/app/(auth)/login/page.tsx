"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/shared/theme-toggle";

type Role = "super-admin" | "clinic-admin" | "patient";

const roles: { value: Role; label: string }[] = [
  { value: "super-admin", label: "Super Admin" },
  { value: "clinic-admin", label: "Clinic Admin" },
  { value: "patient", label: "Patient" },
];

const roleRedirects: Record<Role, string> = {
  "super-admin": "/admin",
  "clinic-admin": "/clinic",
  patient: "/patient",
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("clinic-admin");
  const [remember, setRemember] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push(roleRedirects[role]);
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
            Streamline your clinic operations with intelligent automation
          </h2>
          <p className="mt-4 text-primary-foreground/70">
            Manage appointments, automate patient communication, and optimize
            your practice with AI-powered tools designed for modern healthcare.
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

        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Sign in to your account</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Role selector */}
              <div className="flex flex-col gap-2">
                <Label>Sign in as</Label>
                <div className="grid grid-cols-3 gap-2">
                  {roles.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setRole(r.value)}
                      className={`cursor-pointer rounded-lg border px-3 py-2 text-center text-xs font-medium transition-colors ${
                        role === r.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="doctor@clinic.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Remember me + Forgot password */}
              <div className="flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 cursor-pointer rounded border-border accent-primary"
                  />
                  Remember me
                </label>
                <Link
                  href="/login"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit */}
              <Button type="submit" size="lg" className="w-full cursor-pointer">
                Sign In
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-medium text-primary hover:underline"
              >
                Register
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
