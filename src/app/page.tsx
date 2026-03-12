"use client";

import Link from "next/link";
import { Shield, Building2, Heart, ArrowRight, Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/shared/theme-toggle";

const portals = [
  {
    title: "Super Admin",
    subtitle: "Platform Administration",
    description: "Manage all clinics, users, subscriptions, and AI analytics across the entire platform.",
    icon: Shield,
    href: "/admin",
    gradient: "from-cyan-500/10 to-teal-500/10 dark:from-cyan-500/20 dark:to-teal-500/20",
    iconBg: "bg-gradient-to-br from-cyan-500 to-teal-600",
  },
  {
    title: "Clinic Admin",
    subtitle: "Clinic Management",
    description: "Manage appointments, queue, patients, doctors, billing, and AI voice settings.",
    icon: Building2,
    href: "/clinic",
    gradient: "from-emerald-500/10 to-cyan-500/10 dark:from-emerald-500/20 dark:to-cyan-500/20",
    iconBg: "bg-gradient-to-br from-emerald-500 to-cyan-600",
  },
  {
    title: "Patient Portal",
    subtitle: "Patient Access",
    description: "Book appointments, track queue position, view records, prescriptions, and invoices.",
    icon: Heart,
    href: "/patient",
    gradient: "from-violet-500/10 to-cyan-500/10 dark:from-violet-500/20 dark:to-cyan-500/20",
    iconBg: "bg-gradient-to-br from-violet-500 to-cyan-600",
  },
] as const;

export default function HomePage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      {/* Mesh gradient background */}
      <div className="fixed inset-0 -z-10 gradient-mesh" />
      <div className="fixed inset-0 -z-10 noise" />

      {/* Floating orbs */}
      <div className="fixed top-20 left-[15%] -z-10 h-72 w-72 rounded-full bg-primary/5 blur-3xl animate-float" />
      <div className="fixed bottom-20 right-[10%] -z-10 h-96 w-96 rounded-full bg-accent/5 blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />
      <div className="fixed top-[40%] right-[25%] -z-10 h-48 w-48 rounded-full bg-chart-4/5 blur-3xl animate-float" style={{ animationDelay: "3s" }} />

      <header className="flex items-center justify-between px-6 py-4 animate-fade-in">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Activity className="h-4 w-4 text-primary" />
          <span className="text-xs font-medium tracking-wider uppercase">Healthcare Platform</span>
        </div>
        <ThemeToggle />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 pb-16">
        <div className="mb-16 text-center animate-fade-in-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 mb-6">
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-soft" />
            <span className="text-xs font-semibold text-primary tracking-wide">AI-Powered Platform</span>
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
            <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
              Cliniq
            </span>
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AI
            </span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
            Intelligent clinic management with voice AI, automated scheduling, and real-time patient care.
          </p>
        </div>

        <div className="grid w-full max-w-5xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {portals.map((portal, i) => (
            <Link
              key={portal.href}
              href={portal.href}
              className="group animate-fade-in-up"
              style={{ animationDelay: `${200 + i * 100}ms` }}
            >
              <Card className={`relative h-full cursor-pointer overflow-hidden border-transparent bg-gradient-to-br ${portal.gradient} card-hover`}>
                <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-br from-primary/5 to-transparent" />
                <CardContent className="relative flex flex-col gap-5 p-6">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${portal.iconBg} shadow-lg`}>
                    <portal.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="space-y-1.5">
                    <h2 className="text-xl font-bold text-foreground tracking-tight">
                      {portal.title}
                    </h2>
                    <p className="text-sm font-semibold text-primary">
                      {portal.subtitle}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {portal.description}
                  </p>
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-primary transition-all duration-300 group-hover:gap-3">
                    <span>Open Portal</span>
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-8 flex items-center gap-3 animate-fade-in" style={{ animationDelay: "600ms" }}>
          <Link
            href="/login"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer"
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

      <footer className="py-6 text-center animate-fade-in" style={{ animationDelay: "700ms" }}>
        <p className="text-xs text-muted-foreground/60 tracking-wide">
          CliniqAI v0.1.0 — AI-Powered Healthcare Management
        </p>
      </footer>
    </div>
  );
}
