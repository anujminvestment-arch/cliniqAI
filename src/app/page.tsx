"use client";

import Link from "next/link";
import {
  Shield,
  Building2,
  Heart,
  ArrowRight,
  Activity,
  Sparkles,
  Users,
  Phone,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/shared/theme-toggle";

const portals = [
  {
    title: "Super Admin",
    subtitle: "Platform Management",
    description:
      "Monitor all clinics, manage users, track subscriptions and revenue, oversee AI analytics.",
    icon: Shield,
    href: "/login?redirect=/admin",
    metric: "Demo data",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    hoverClass: "card-hover",
    borderAccent: "hover:border-primary/30",
  },
  {
    title: "Clinic Admin",
    subtitle: "Clinic Operations",
    description:
      "Manage appointments, patient queue, staff scheduling, billing, and AI voice settings.",
    icon: Building2,
    href: "/login?redirect=/clinic",
    metric: "Demo data",
    iconBg: "bg-accent/10",
    iconColor: "text-accent",
    hoverClass: "card-hover-accent",
    borderAccent: "hover:border-accent/30",
  },
  {
    title: "Patient Portal",
    subtitle: "Your Health Hub",
    description:
      "Book appointments, track your queue position, view records, prescriptions, and invoices.",
    icon: Heart,
    href: "/login?redirect=/patient",
    metric: "Demo data",
    iconBg: "bg-violet-500/10",
    iconColor: "text-violet-500",
    hoverClass: "card-hover-violet",
    borderAccent: "hover:border-violet-500/30",
  },
] as const;

const metrics = [
  { label: "Active Clinics", value: "248+" },
  { label: "Patients Served", value: "15k+" },
  { label: "AI Calls/mo", value: "3,200+" },
  { label: "Uptime", value: "99.9%" },
];

export default function HomePage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      {/* Background layers */}
      <div className="fixed inset-0 -z-10 gradient-hero" />
      <div className="fixed inset-0 -z-10 dot-pattern opacity-40" />
      <div className="fixed inset-0 -z-10 noise" />

      {/* Decorative blurs */}
      <div
        className="fixed top-16 left-[10%] -z-10 h-80 w-80 rounded-full bg-primary/6 blur-3xl animate-float"
      />
      <div
        className="fixed bottom-16 right-[8%] -z-10 h-96 w-96 rounded-full bg-accent/5 blur-3xl animate-float"
        style={{ animationDelay: "2s" }}
      />
      <div
        className="fixed top-[45%] right-[20%] -z-10 h-48 w-48 rounded-full bg-chart-4/5 blur-3xl animate-float"
        style={{ animationDelay: "4s" }}
      />

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 animate-fade-in">
        <div className="flex items-center gap-2.5 text-muted-foreground">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg gradient-primary">
            <Activity className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-xs font-semibold tracking-widest uppercase">
            Healthcare Platform
          </span>
        </div>
        <ThemeToggle />
      </header>

      {/* Main */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 pb-12">
        {/* Hero */}
        <div className="mb-14 text-center animate-fade-in-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 mb-6">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary tracking-wide">
              AI-Powered Platform
            </span>
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
            <span className="text-foreground">Cliniq</span>
            <span className="text-gradient-primary">AI</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Intelligent clinic management with voice AI, automated scheduling,
            and real-time patient care.
          </p>

          {/* Trust metrics */}
          <div
            className="mt-8 inline-flex flex-wrap items-center justify-center gap-4 sm:gap-6 rounded-2xl border bg-card/60 backdrop-blur px-4 sm:px-6 py-3 animate-fade-in-up"
            style={{ animationDelay: "200ms" }}
          >
            {metrics.map((m, i) => (
              <div key={m.label} className="flex items-center gap-6">
                {i > 0 && <div className="h-6 w-px bg-border" />}
                <div className="text-center">
                  <p className="text-base font-bold text-foreground leading-none">
                    {m.value}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {m.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Portal cards */}
        <div className="grid w-full max-w-5xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {portals.map((portal, i) => (
            <Link
              key={portal.href}
              href={portal.href}
              className="group animate-fade-in-up"
              style={{ animationDelay: `${300 + i * 100}ms` }}
            >
              <Card
                className={`relative h-full cursor-pointer overflow-hidden border bg-card/80 backdrop-blur-sm transition-all duration-300 ${portal.hoverClass} ${portal.borderAccent}`}
              >
                <CardContent className="relative flex flex-col gap-5 p-6">
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl ${portal.iconBg}`}
                    >
                      <portal.icon className={`h-6 w-6 ${portal.iconColor}`} />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                      {portal.metric}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <h2 className="text-xl font-bold text-foreground tracking-tight">
                      {portal.title}
                    </h2>
                    <p className={`text-sm font-semibold ${portal.iconColor}`}>
                      {portal.subtitle}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {portal.description}
                  </p>
                  <div
                    className={`flex items-center gap-1.5 text-sm font-semibold ${portal.iconColor} transition-all duration-300 group-hover:gap-3`}
                  >
                    <span>Open Portal</span>
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Auth links */}
        <div
          className="mt-8 flex items-center gap-3 animate-fade-in"
          style={{ animationDelay: "700ms" }}
        >
          <Link
            href="/login"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            Sign in to your account
          </Link>
          <span className="text-muted-foreground/30">|</span>
          <Link
            href="/register"
            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer"
          >
            Create an account
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer
        className="py-6 text-center animate-fade-in"
        style={{ animationDelay: "800ms" }}
      >
        <p className="text-xs text-muted-foreground/60 tracking-wide">
          CliniqAI v0.1.0 — AI-Powered Healthcare Management
        </p>
      </footer>
    </div>
  );
}
