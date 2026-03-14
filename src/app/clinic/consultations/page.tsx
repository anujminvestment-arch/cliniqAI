"use client";

import { useState } from "react";
import {
  Stethoscope,
  Search,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  FileText,
  UserRound,
  PhoneCall,
  MessageSquare,
  Brain,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { StatCard } from "@/components/shared/stat-card";
import { consultationsList, doctorsList } from "@/lib/mock-data";

const typeIcons: Record<string, React.ElementType> = {
  "In-Person": UserRound,
  "Follow-up": Stethoscope,
  "AI Call": PhoneCall,
};

const typeColors: Record<string, string> = {
  "In-Person": "bg-primary/10 text-primary",
  "Follow-up": "bg-accent/10 text-accent",
  "AI Call": "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
};

export default function ConsultationsPage() {
  const [search, setSearch] = useState("");
  const [doctorFilter, setDoctorFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = consultationsList.filter((c) => {
    const matchesSearch =
      c.patient.toLowerCase().includes(search.toLowerCase()) ||
      c.summary.toLowerCase().includes(search.toLowerCase());
    const matchesDoctor = doctorFilter === "all" || c.doctor === doctorFilter;
    return matchesSearch && matchesDoctor;
  });

  const totalConsultations = consultationsList.length;
  const avgDuration =
    Math.round(
      consultationsList.reduce((sum, c) => sum + parseInt(c.duration), 0) / consultationsList.length
    ) + " min";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight section-header">Consultations</h1>
        <p className="text-muted-foreground">View consultation records and AI transcript summaries</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Total Consultations" value={totalConsultations} icon={Stethoscope} color="primary" />
        <StatCard title="Avg Duration" value={avgDuration} icon={Clock} color="accent" />
        <StatCard title="AI Transcripts" value={consultationsList.filter((c) => c.transcript).length} icon={Brain} color="violet" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search patient or keywords..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={doctorFilter} onValueChange={(v) => setDoctorFilter(v ?? "all")}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by doctor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Doctors</SelectItem>
            {doctorsList.map((d) => (
              <SelectItem key={d.id} value={d.name}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {filtered.map((consultation, i) => {
          const TypeIcon = typeIcons[consultation.type] || Stethoscope;
          const isExpanded = expandedId === consultation.id;

          return (
            <Card
              key={consultation.id}
              className="card-hover animate-fade-in-up"
              style={{ animationDelay: `${i * 75}ms` }}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl shrink-0 ${typeColors[consultation.type]}`}>
                      <TypeIcon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">{consultation.patient}</span>
                        <Badge variant="outline" className="text-[10px]">{consultation.type}</Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {consultation.date}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {consultation.duration}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{consultation.summary}</p>

                      <div className="flex flex-wrap gap-4 pt-1">
                        <div>
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Symptoms</p>
                          <div className="flex flex-wrap gap-1">
                            {consultation.symptoms.map((s) => (
                              <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Suggested Diagnosis</p>
                          <Badge className="bg-primary/10 text-primary text-[10px]">
                            <Brain className="h-3 w-3 mr-1" />
                            {consultation.suggestedDiagnosis}
                          </Badge>
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground">
                        {consultation.doctor}
                      </p>

                      {isExpanded && (
                        <div className="mt-3 space-y-3 animate-fade-in">
                          {consultation.transcript && (
                            <div className="rounded-lg bg-muted/50 p-4">
                              <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                                <MessageSquare className="h-3.5 w-3.5" />
                                Full Transcript
                              </p>
                              <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">
                                {consultation.transcript}
                              </pre>
                            </div>
                          )}
                          {consultation.doctorNotes && (
                            <div className="rounded-lg bg-primary/5 border border-primary/10 p-3">
                              <p className="text-xs font-semibold text-primary mb-1 flex items-center gap-1.5">
                                <FileText className="h-3.5 w-3.5" />
                                Doctor&apos;s Notes
                              </p>
                              <p className="text-sm">{consultation.doctorNotes}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="cursor-pointer shrink-0"
                    onClick={() => setExpandedId(isExpanded ? null : consultation.id)}
                  >
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Stethoscope className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="font-medium">No consultations found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
