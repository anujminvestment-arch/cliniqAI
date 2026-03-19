"use client";

import Link from "next/link";
import {
  Shield,
  Building2,
  Heart,
  ArrowRight,
  Activity,
  Sparkles,
  Phone,
  CalendarCheck,
  Users,
  Bot,
  ListOrdered,
  CreditCard,
  Bell,
  Video,
  FileText,
  BarChart3,
  CheckCircle2,
  Zap,
  Globe,
  Lock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";

const portals = [
  {
    title: "Super Admin",
    subtitle: "Platform Management",
    description:
      "Monitor all clinics, manage users, track subscriptions, oversee AI analytics and compliance.",
    icon: Shield,
    href: "/login?redirect=/admin",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    hoverClass: "card-hover",
    borderAccent: "hover:border-primary/30",
    gradient: "from-primary/5 to-transparent",
  },
  {
    title: "Clinic Admin",
    subtitle: "Clinic Operations",
    description:
      "Manage appointments, patient queue, staff scheduling, billing, and AI voice settings.",
    icon: Building2,
    href: "/login?redirect=/clinic",
    iconBg: "bg-accent/10",
    iconColor: "text-accent",
    hoverClass: "card-hover-accent",
    borderAccent: "hover:border-accent/30",
    gradient: "from-accent/5 to-transparent",
  },
  {
    title: "Patient Portal",
    subtitle: "Your Health Hub",
    description:
      "Book appointments, track your queue, view records, prescriptions, and pay invoices online.",
    icon: Heart,
    href: "/login?redirect=/patient",
    iconBg: "bg-violet-500/10",
    iconColor: "text-violet-500",
    hoverClass: "card-hover-violet",
    borderAccent: "hover:border-violet-500/30",
    gradient: "from-violet-500/5 to-transparent",
  },
] as const;

const metrics = [
  { label: "Active Clinics", value: "248+", icon: Building2 },
  { label: "Patients Served", value: "15k+", icon: Users },
  { label: "AI Calls / mo", value: "3,200+", icon: Phone },
  { label: "Uptime", value: "99.9%", icon: Zap },
];

const features = [
  {
    icon: Bot,
    title: "AI Voice Receptionist",
    description: "Handles calls 24/7, books appointments, checks queue status, and escalates emergencies.",
    color: "text-primary bg-primary/10",
  },
  {
    icon: CalendarCheck,
    title: "Smart Scheduling",
    description: "Multi-doctor appointment slots with buffer time, no-show detection, and auto-fill waitlist.",
    color: "text-accent bg-accent/10",
  },
  {
    icon: ListOrdered,
    title: "Live Queue Management",
    description: "Real-time queue tracking with estimated wait times, priority rules, and WhatsApp updates.",
    color: "text-violet-500 bg-violet-500/10",
  },
  {
    icon: CreditCard,
    title: "Billing & Payments",
    description: "Generate invoices, accept Razorpay/UPI payments, send automated payment reminders.",
    color: "text-emerald-500 bg-emerald-500/10",
  },
  {
    icon: FileText,
    title: "Digital Prescriptions",
    description: "Create e-signed prescriptions delivered instantly via WhatsApp with print-friendly format.",
    color: "text-amber-500 bg-amber-500/10",
  },
  {
    icon: Bell,
    title: "Notification Engine",
    description: "WhatsApp-first notifications for appointments, queue updates, payments, and follow-ups.",
    color: "text-rose-500 bg-rose-500/10",
  },
  {
    icon: Video,
    title: "Telemedicine Ready",
    description: "Integrated video consultations with waiting room, screen sharing, and session recording.",
    color: "text-sky-500 bg-sky-500/10",
  },
  {
    icon: BarChart3,
    title: "Clinic Analytics",
    description: "Revenue trends, no-show rates, doctor utilization, patient satisfaction benchmarks.",
    color: "text-indigo-500 bg-indigo-500/10",
  },
];

const steps = [
  { number: "01", title: "Onboard Your Clinic", description: "Set up your clinic profile, add doctors, configure AI voice settings." },
  { number: "02", title: "Patients Connect", description: "Patients book via AI calls, WhatsApp, QR codes, or patient portal." },
  { number: "03", title: "AI Manages Flow", description: "Automated scheduling, queue management, reminders, and follow-ups." },
  { number: "04", title: "Grow & Optimize", description: "Track analytics, reduce no-shows, increase revenue per patient." },
];

export default function HomePage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      {/* Background layers */}
      <div className="fixed inset-0 -z-10 gradient-hero" />
      <div className="fixed inset-0 -z-10 dot-pattern opacity-40" />
      <div className="fixed inset-0 -z-10 noise" />

      {/* Decorative blurs */}
      <div className="fixed top-16 left-[10%] -z-10 h-80 w-80 rounded-full bg-primary/6 blur-3xl animate-float" />
      <div
        className="fixed bottom-16 right-[8%] -z-10 h-96 w-96 rounded-full bg-accent/5 blur-3xl animate-float"
        style={{ animationDelay: "2s" }}
      />
      <div
        className="fixed top-[45%] right-[20%] -z-10 h-48 w-48 rounded-full bg-chart-4/5 blur-3xl animate-float"
        style={{ animationDelay: "4s" }}
      />

      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-3 glass animate-fade-in">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary shadow-md shadow-primary/20">
            <Activity className="h-4 w-4 text-white" />
          </div>
          <span className="text-base font-bold tracking-tight">
            Cliniq<span className="text-gradient-primary">AI</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/login">
            <Button variant="ghost" size="sm" className="cursor-pointer text-muted-foreground">
              Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm" className="cursor-pointer">
              Get Started
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center px-4 pt-20 pb-16">
          <div className="mb-14 text-center animate-fade-in-up max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 mb-6">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary tracking-wide">
                AI-Powered Healthcare Platform
              </span>
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl leading-[1.1]">
              <span className="text-foreground">Your clinic, </span>
              <br className="hidden sm:block" />
              <span className="text-gradient-primary">intelligently managed</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Voice AI receptionist, smart scheduling, live queue management, and automated patient
              communication — all in one platform built for Indian clinics.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/register">
                <Button size="lg" className="cursor-pointer h-12 px-8 text-sm font-semibold shadow-lg shadow-primary/20">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="cursor-pointer h-12 px-8 text-sm font-semibold">
                  View Demo
                </Button>
              </Link>
            </div>
          </div>

          {/* Trust metrics */}
          <div
            className="inline-flex flex-wrap items-center justify-center gap-6 sm:gap-8 rounded-2xl border bg-card/60 backdrop-blur-sm px-6 sm:px-8 py-4 animate-fade-in-up"
            style={{ animationDelay: "200ms" }}
          >
            {metrics.map((m, i) => (
              <div key={m.label} className="flex items-center gap-6">
                {i > 0 && <div className="h-8 w-px bg-border" />}
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/8">
                    <m.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-foreground leading-none">
                      {m.value}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {m.label}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Portal Cards */}
        <section className="px-4 pb-20">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10 animate-fade-in-up" style={{ animationDelay: "250ms" }}>
              <h2 className="text-2xl font-bold tracking-tight">Choose Your Portal</h2>
              <p className="text-muted-foreground mt-1.5">Three dedicated interfaces, one unified platform</p>
            </div>
            <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
                    {/* Top gradient accent bar */}
                    <div className={`h-1 w-full bg-gradient-to-r ${portal.gradient}`} />
                    <CardContent className="relative flex flex-col gap-5 p-6">
                      <div className="flex items-center justify-between">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-xl ${portal.iconBg} transition-transform duration-300 group-hover:scale-110`}
                        >
                          <portal.icon className={`h-6 w-6 ${portal.iconColor}`} />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <h3 className="text-xl font-bold text-foreground tracking-tight">
                          {portal.title}
                        </h3>
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
          </div>
        </section>

        {/* Features Section */}
        <section className="px-4 pb-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5 mb-4">
                <Zap className="h-3.5 w-3.5 text-accent" />
                <span className="text-xs font-semibold text-accent tracking-wide">
                  Everything You Need
                </span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight">
                Built for modern clinics
              </h2>
              <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
                From AI-powered voice calls to automated billing — every tool your clinic needs to
                operate efficiently.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, i) => (
                <Card
                  key={feature.title}
                  className="group border bg-card/60 backdrop-blur-sm card-hover animate-fade-in-up"
                  style={{ animationDelay: `${i * 75}ms` }}
                >
                  <CardContent className="p-5 space-y-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${feature.color} transition-transform duration-300 group-hover:scale-110`}>
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold text-sm tracking-tight">{feature.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="px-4 pb-20">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight">How it works</h2>
              <p className="text-muted-foreground mt-2">
                Go from signup to fully automated clinic in minutes
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, i) => (
                <div key={step.number} className="relative animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="text-5xl font-extrabold text-primary/10 dark:text-primary/15 leading-none mb-3">
                    {step.number}
                  </div>
                  <h3 className="font-semibold text-base mb-1.5">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                  {i < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-6 -right-3 w-6">
                      <ArrowRight className="h-4 w-4 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 pb-20">
          <div className="max-w-3xl mx-auto">
            <Card className="overflow-hidden border-0">
              <div className="relative gradient-primary px-8 py-14 text-center">
                <div className="absolute inset-0 dot-pattern opacity-20" />
                <div className="relative z-10 space-y-5">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5">
                    <Lock className="h-3.5 w-3.5 text-white/80" />
                    <span className="text-xs font-semibold text-white/80 tracking-wide">
                      HIPAA & DPDPA Compliant
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold text-white tracking-tight">
                    Ready to transform your clinic?
                  </h2>
                  <p className="text-white/60 max-w-md mx-auto">
                    Join 248+ clinics across India already using CliniqAI to automate operations and
                    deliver better patient care.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <Link href="/register">
                      <Button
                        size="lg"
                        className="cursor-pointer h-12 px-8 bg-white text-primary hover:bg-white/90 font-semibold shadow-lg"
                      >
                        Get Started Free
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/login">
                      <Button
                        variant="ghost"
                        size="lg"
                        className="cursor-pointer h-12 px-8 text-white/80 hover:text-white hover:bg-white/10 font-semibold"
                      >
                        View Demo
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Security Badges */}
        <section className="px-4 pb-12">
          <div className="max-w-2xl mx-auto">
            <div className="flex flex-wrap items-center justify-center gap-6 text-muted-foreground/50">
              <div className="flex items-center gap-2 text-xs">
                <Lock className="h-3.5 w-3.5" />
                <span>256-bit Encryption</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Shield className="h-3.5 w-3.5" />
                <span>DPDPA Compliant</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Globe className="h-3.5 w-3.5" />
                <span>99.9% Uptime SLA</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>SOC 2 Type II</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center border-t">
        <p className="text-xs text-muted-foreground/60 tracking-wide">
          CliniqAI v0.1.0 — AI-Powered Healthcare Management
        </p>
      </footer>
    </div>
  );
}
