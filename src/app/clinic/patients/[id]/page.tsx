"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Heart,
  Activity,
  Droplets,
  Weight,
  Thermometer,
  Wind,
  Brain,
  AlertTriangle,
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
  FileText,
  Pill,
  TestTube,
  Clock,
  Share2,
  ChevronDown,
  ChevronUp,
  Mic,
  UserRound,
  PhoneCall,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { patientDetails } from "@/lib/mock-data";

const vitalIcons: Record<string, React.ElementType> = {
  "Blood Pressure": Activity,
  "Heart Rate": Heart,
  Weight: Weight,
  "Blood Sugar": Droplets,
  SpO2: Wind,
  Temperature: Thermometer,
};

const vitalColors: Record<string, string> = {
  normal: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  critical: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const trendIcons: Record<string, React.ElementType> = {
  up: TrendingUp,
  down: TrendingDown,
  stable: Minus,
};

const rxStatusColors: Record<string, string> = {
  sent: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  viewed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
};

const transcriptTypeIcons: Record<string, React.ElementType> = {
  "AI Call": PhoneCall,
  "In-Person": UserRound,
  "Follow-up": Phone,
};

export default function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const patient = patientDetails[id];
  const [expandedTranscript, setExpandedTranscript] = useState<string | null>(null);

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <UserRound className="h-16 w-16 text-muted-foreground/30" />
        <p className="text-xl font-semibold">Patient not found</p>
        <Link href="/clinic/patients">
          <Button variant="outline" className="cursor-pointer">
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Patients
          </Button>
        </Link>
      </div>
    );
  }

  const initials = patient.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/clinic/patients">
          <Button variant="ghost" size="icon" className="cursor-pointer">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Patient Record</h1>
          <p className="text-muted-foreground">Detailed health overview and history</p>
        </div>
      </div>

      {/* Profile Card */}
      <Card className="animate-fade-in-up">
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <Avatar className="h-20 w-20 text-2xl">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold">{patient.name}</h2>
                  <p className="text-muted-foreground">
                    {patient.age} yrs, {patient.gender} &middot; Blood Type:{" "}
                    <span className="font-semibold text-foreground">{patient.bloodType}</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary">{patient.id.toUpperCase()}</Badge>
                  <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                    Active
                  </Badge>
                </div>
              </div>
              <div className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" />
                  {patient.phone}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  {patient.email}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  {patient.address.split(",").slice(-2).join(",").trim()}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  Registered: {patient.registeredDate}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vitals */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Health Vitals</h3>
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {patient.vitals.map((vital, i) => {
            const VitalIcon = vitalIcons[vital.label] || Activity;
            const TrendIcon = trendIcons[vital.trend];
            return (
              <Card
                key={vital.label}
                className="card-hover animate-fade-in-up"
                style={{ animationDelay: `${i * 75}ms` }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${vitalColors[vital.status]}`}>
                      <VitalIcon className="h-4 w-4" />
                    </div>
                    <TrendIcon className={`h-3.5 w-3.5 ${
                      vital.trend === "up" ? "text-amber-500" : vital.trend === "down" ? "text-blue-500" : "text-muted-foreground"
                    }`} />
                  </div>
                  <p className="text-xl font-bold tracking-tight">
                    {vital.value}
                    <span className="text-xs font-normal text-muted-foreground ml-1">{vital.unit}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{vital.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Allergies & Conditions */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="animate-fade-in-up delay-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Allergies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {patient.allergies.map((allergy) => (
                <Badge key={allergy} variant="secondary" className="bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400">
                  {allergy}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="animate-fade-in-up delay-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Heart className="h-4 w-4 text-primary" />
              Conditions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {patient.conditions.map((condition) => (
                <Badge key={condition} variant="secondary">
                  {condition}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Root Cause Analysis */}
      <Card className="animate-fade-in-up delay-300 border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">AI Root Cause Analysis</CardTitle>
              <CardDescription>AI-powered analysis of patient conditions</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="rounded-lg bg-primary/5 p-4 border border-primary/10">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-semibold">Primary Diagnosis</p>
              <Badge className="bg-primary/10 text-primary">{patient.rootCauseAnalysis.confidence}% confidence</Badge>
            </div>
            <p className="text-base font-medium">{patient.rootCauseAnalysis.primaryDiagnosis}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-semibold mb-2">Contributing Factors</p>
              <ul className="space-y-2">
                {patient.rootCauseAnalysis.contributingFactors.map((factor, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                    {factor}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold mb-2">Risk Factors</p>
              <ul className="space-y-2">
                {patient.rootCauseAnalysis.riskFactors.map((risk, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                    {risk}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-sm font-semibold mb-2">Recommended Investigations</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {patient.rootCauseAnalysis.recommendedInvestigations.map((inv, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-sm">
                  <Search className="h-3.5 w-3.5 text-primary shrink-0" />
                  {inv}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs: Transcripts, Visit Timeline, Prescriptions, Lab Results */}
      <Tabs defaultValue="transcripts">
        <TabsList>
          <TabsTrigger value="transcripts" className="cursor-pointer">
            <Mic className="h-3.5 w-3.5 mr-1.5" />
            AI Transcripts
          </TabsTrigger>
          <TabsTrigger value="visits" className="cursor-pointer">
            <Calendar className="h-3.5 w-3.5 mr-1.5" />
            Visit Timeline
          </TabsTrigger>
          <TabsTrigger value="prescriptions" className="cursor-pointer">
            <Pill className="h-3.5 w-3.5 mr-1.5" />
            Prescriptions
          </TabsTrigger>
          <TabsTrigger value="lab" className="cursor-pointer">
            <TestTube className="h-3.5 w-3.5 mr-1.5" />
            Lab Results
          </TabsTrigger>
        </TabsList>

        {/* Transcripts */}
        <TabsContent value="transcripts" className="mt-4 space-y-3">
          {patient.transcripts.map((t) => {
            const TypeIcon = transcriptTypeIcons[t.type] || PhoneCall;
            const isExpanded = expandedTranscript === t.id;
            return (
              <Card key={t.id} className="card-hover">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 shrink-0 mt-0.5">
                        <TypeIcon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">{t.type}</Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {t.date}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {t.duration}
                          </span>
                        </div>
                        <p className="text-sm">{t.summary}</p>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {t.topics.map((topic) => (
                            <Badge key={topic} variant="secondary" className="text-[10px]">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="cursor-pointer shrink-0"
                      onClick={() => setExpandedTranscript(isExpanded ? null : t.id)}
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* Visit Timeline */}
        <TabsContent value="visits" className="mt-4">
          <Card>
            <CardContent className="p-4">
              <div className="relative pl-6 space-y-6">
                <div className="absolute left-[11px] top-2 bottom-2 w-px bg-border" />
                {patient.visitTimeline.map((visit, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-6 top-1 h-3 w-3 rounded-full border-2 border-primary bg-background" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold">{visit.diagnosis}</span>
                        <Badge variant="outline" className="text-[10px]">{visit.type}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {visit.date} &middot; {visit.doctor}
                      </p>
                      <p className="text-sm text-muted-foreground">{visit.notes}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Prescriptions */}
        <TabsContent value="prescriptions" className="mt-4 space-y-3">
          {patient.prescriptionHistory.map((rx) => (
            <Card key={rx.id} className="card-hover">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{rx.doctor}</p>
                      <Badge variant="secondary" className={rxStatusColors[rx.status]}>
                        {rx.status.charAt(0).toUpperCase() + rx.status.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{rx.date} &middot; {rx.id}</p>
                  </div>
                  <Button variant="outline" size="sm" className="cursor-pointer text-xs">
                    <Share2 className="h-3 w-3 mr-1" />
                    Share
                  </Button>
                </div>
                <div className="space-y-2">
                  {rx.medications.map((med, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2 text-sm">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-medium text-primary shrink-0">
                        {i + 1}
                      </span>
                      <span className="font-medium">{med.name}</span>
                      <span className="text-muted-foreground">{med.dosage} &middot; {med.frequency} &middot; {med.duration}</span>
                    </div>
                  ))}
                </div>
                {rx.notes && (
                  <div className="mt-2 flex items-start gap-2 rounded-lg bg-muted/30 p-2.5 text-xs text-muted-foreground">
                    <FileText className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    {rx.notes}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Lab Results */}
        <TabsContent value="lab" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Test</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead>Normal Range</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patient.labResults.map((lab) => (
                    <TableRow key={lab.id}>
                      <TableCell className="text-muted-foreground text-sm">{lab.date}</TableCell>
                      <TableCell className="font-medium">{lab.test}</TableCell>
                      <TableCell className={lab.status === "abnormal" ? "text-red-600 dark:text-red-400 font-medium" : ""}>
                        {lab.result}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{lab.normalRange}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            lab.status === "normal"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          }
                        >
                          {lab.status.charAt(0).toUpperCase() + lab.status.slice(1)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
