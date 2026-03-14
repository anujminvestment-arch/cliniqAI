"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Mail,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
    setIsSubmitted(true);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      {/* Mobile branding */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2">
        <h1 className="text-2xl font-bold text-gradient-primary">CliniqAI</h1>
      </div>

      {!isSubmitted ? (
        <Card className="w-full max-w-[440px] border-border/60 shadow-lg">
          <CardHeader className="text-center pb-2 pt-8">
            <CardTitle className="text-2xl font-semibold tracking-tight">
              Reset your password
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter your email and we&apos;ll send you a reset link
            </p>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
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
                      if (error) setError("");
                    }}
                    className={`pl-10 h-11 transition-shadow focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-0 ${
                      error ? "border-destructive focus-visible:ring-destructive/30" : ""
                    }`}
                    aria-invalid={!!error}
                    aria-describedby={error ? "email-error" : undefined}
                  />
                </div>
                {error && (
                  <p id="email-error" className="text-xs text-destructive" role="alert">
                    {error}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full h-12 text-sm font-semibold tracking-wide"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Reset Link
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="w-full max-w-[440px] border-border/60 shadow-lg">
          <CardContent className="flex flex-col items-center gap-6 px-8 pt-10 pb-10 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-foreground tracking-tight">
                Check your email
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                We&apos;ve sent a password reset link to{" "}
                <span className="font-medium text-foreground">{email}</span>.
                Check your inbox and follow the instructions.
              </p>
            </div>

            <Button
              variant="outline"
              size="lg"
              className="w-full h-12 text-sm font-semibold"
              onClick={() => {
                setIsSubmitted(false);
                setEmail("");
              }}
            >
              Try a different email
            </Button>

            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to sign in
            </Link>
          </CardContent>
        </Card>
      )}

      <p className="absolute bottom-6 text-xs text-muted-foreground/60 text-center">
        Protected by enterprise-grade security. Your healthcare data is encrypted and HIPAA-compliant.
      </p>
    </div>
  );
}
