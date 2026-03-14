"use client";

import { useState } from "react";
import {
  Star,
  Search,
  ThumbsUp,
  Meh,
  ThumbsDown,
  ExternalLink,
  MessageSquare,
  Users,
  BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { StatCard } from "@/components/shared/stat-card";

const sentimentColors: Record<string, string> = {
  Positive: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Neutral: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Negative: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const sentimentIcons: Record<string, React.ElementType> = {
  Positive: ThumbsUp,
  Neutral: Meh,
  Negative: ThumbsDown,
};

const feedbackRecords = [
  { id: "FB-001", patient: "Priya Sharma", doctor: "Dr. Priya Patel", visitDate: "13 Mar 2026", doctorRating: 5, staffRating: 4, waitRating: 4, comment: "Excellent consultation! Dr. Patel was very thorough and explained everything clearly.", sentiment: "Positive" },
  { id: "FB-002", patient: "Rahul Mehta", doctor: "Dr. Amit Shah", visitDate: "13 Mar 2026", doctorRating: 4, staffRating: 5, waitRating: 3, comment: "Good treatment but had to wait longer than expected. Staff was very helpful though.", sentiment: "Neutral" },
  { id: "FB-003", patient: "Anjali Desai", doctor: "Dr. Neha Gupta", visitDate: "12 Mar 2026", doctorRating: 5, staffRating: 5, waitRating: 5, comment: "Best dental experience ever! The whole team was amazing and the clinic is very clean.", sentiment: "Positive" },
  { id: "FB-004", patient: "Vikram Singh", doctor: "Dr. Rajesh Kumar", visitDate: "12 Mar 2026", doctorRating: 3, staffRating: 3, waitRating: 2, comment: "The wait was too long and the treatment felt rushed. Expected better for the price.", sentiment: "Negative" },
  { id: "FB-005", patient: "Neha Gupta", doctor: "Dr. Priya Patel", visitDate: "11 Mar 2026", doctorRating: 5, staffRating: 4, waitRating: 4, comment: "Dr. Patel is incredibly knowledgeable. Very satisfied with the treatment plan.", sentiment: "Positive" },
  { id: "FB-006", patient: "Arjun Patel", doctor: "Dr. Amit Shah", visitDate: "11 Mar 2026", doctorRating: 4, staffRating: 4, waitRating: 3, comment: "Decent experience overall. The online booking system is very convenient.", sentiment: "Positive" },
  { id: "FB-007", patient: "Kavita Reddy", doctor: "Dr. Neha Gupta", visitDate: "10 Mar 2026", doctorRating: 5, staffRating: 5, waitRating: 4, comment: "Wonderful service! Dr. Gupta really takes time to understand the problem.", sentiment: "Positive" },
  { id: "FB-008", patient: "Suresh Kumar", doctor: "Dr. Rajesh Kumar", visitDate: "10 Mar 2026", doctorRating: 4, staffRating: 3, waitRating: 3, comment: "Treatment was fine but the billing process was confusing. Needs improvement.", sentiment: "Neutral" },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i < rating
              ? "fill-amber-400 text-amber-400"
              : "fill-none text-muted-foreground/30"
          }`}
        />
      ))}
    </div>
  );
}

export default function FeedbackPage() {
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [doctorFilter, setDoctorFilter] = useState("all");

  const doctors = [...new Set(feedbackRecords.map((f) => f.doctor))];

  const filtered = feedbackRecords.filter((fb) => {
    const matchesSearch =
      fb.patient.toLowerCase().includes(search.toLowerCase()) ||
      fb.comment.toLowerCase().includes(search.toLowerCase());
    const matchesDoctor = doctorFilter === "all" || fb.doctor === doctorFilter;
    const matchesDate =
      dateFilter === "all" ||
      (dateFilter === "today" && fb.visitDate.includes("13 Mar")) ||
      (dateFilter === "week" &&
        (fb.visitDate.includes("13 Mar") ||
          fb.visitDate.includes("12 Mar") ||
          fb.visitDate.includes("11 Mar") ||
          fb.visitDate.includes("10 Mar")));
    return matchesSearch && matchesDoctor && matchesDate;
  });

  const avgDoctor =
    (feedbackRecords.reduce((sum, f) => sum + f.doctorRating, 0) / feedbackRecords.length).toFixed(1);
  const avgStaff =
    (feedbackRecords.reduce((sum, f) => sum + f.staffRating, 0) / feedbackRecords.length).toFixed(1);
  const responseRate = "87%";
  const npsScore = 72;

  const highSatPatients = feedbackRecords.filter(
    (f) => f.doctorRating >= 4 && f.staffRating >= 4
  ).length;
  const googleReviews = 4;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight section-header">Patient Feedback</h1>
        <p className="text-muted-foreground">Ratings, reviews, and patient satisfaction insights</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Overall NPS Score"
          value={npsScore}
          icon={BarChart3}
          color="primary"
          trend={{ value: 5, positive: true }}
        />
        <StatCard
          title="Avg Doctor Rating"
          value={`${avgDoctor}/5`}
          icon={Star}
          color="amber"
        />
        <StatCard
          title="Avg Staff Rating"
          value={`${avgStaff}/5`}
          icon={Users}
          color="emerald"
        />
        <StatCard
          title="Response Rate"
          value={responseRate}
          icon={MessageSquare}
          color="violet"
          trend={{ value: 3, positive: true }}
        />
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base">All Feedback</CardTitle>
            <div className="flex flex-wrap gap-2">
              <div className="relative max-w-xs">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search patient or comment..."
                  className="pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={dateFilter} onValueChange={(v) => setDateFilter(v ?? "all")}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                </SelectContent>
              </Select>
              <Select value={doctorFilter} onValueChange={(v) => setDoctorFilter(v ?? "all")}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Doctors</SelectItem>
                  {doctors.map((doc) => (
                    <SelectItem key={doc} value={doc}>
                      {doc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto scrollbar-thin">
            <Table className="table-enhanced">
              <TableHeader>
                <TableRow>
                  <TableHead>Patient Name</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Visit Date</TableHead>
                  <TableHead>Doctor Rating</TableHead>
                  <TableHead>Staff Rating</TableHead>
                  <TableHead>Wait Rating</TableHead>
                  <TableHead className="max-w-[200px]">Comment</TableHead>
                  <TableHead>Sentiment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((fb) => {
                  const SentimentIcon = sentimentIcons[fb.sentiment];
                  return (
                    <TableRow key={fb.id}>
                      <TableCell className="font-medium">{fb.patient}</TableCell>
                      <TableCell className="text-muted-foreground">{fb.doctor}</TableCell>
                      <TableCell className="text-muted-foreground">{fb.visitDate}</TableCell>
                      <TableCell>
                        <StarRating rating={fb.doctorRating} />
                      </TableCell>
                      <TableCell>
                        <StarRating rating={fb.staffRating} />
                      </TableCell>
                      <TableCell>
                        <StarRating rating={fb.waitRating} />
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <p className="text-sm text-muted-foreground truncate" title={fb.comment}>
                          {fb.comment}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={sentimentColors[fb.sentiment]}>
                          <SentimentIcon className="h-3 w-3 mr-1" />
                          {fb.sentiment}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                      No feedback found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ExternalLink className="h-4 w-4 text-primary" />
            Google Review Prompts
          </CardTitle>
          <CardDescription>
            High-satisfaction patients automatically prompted to leave Google reviews
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">High Satisfaction Patients</p>
              <p className="text-2xl font-bold">{highSatPatients}</p>
              <p className="text-xs text-muted-foreground mt-1">Rating 4+ across categories</p>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Prompted for Review</p>
              <p className="text-2xl font-bold">{highSatPatients}</p>
              <p className="text-xs text-muted-foreground mt-1">Auto-sent via SMS/WhatsApp</p>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Reviews Left</p>
              <p className="text-2xl font-bold text-emerald-600">{googleReviews}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {Math.round((googleReviews / highSatPatients) * 100)}% conversion rate
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
