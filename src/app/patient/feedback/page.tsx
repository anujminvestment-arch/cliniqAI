"use client";

import { useState } from "react";
import {
  Star,
  MessageSquare,
  ThumbsUp,
  Clock,
  Stethoscope,
  MapPin,
  CalendarDays,
  ExternalLink,
  Send,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatCard } from "@/components/shared/stat-card";

interface PendingFeedback {
  id: string;
  doctor: string;
  doctorInitials: string;
  clinic: string;
  visitDate: string;
}

interface CompletedFeedback {
  id: string;
  doctor: string;
  doctorInitials: string;
  clinic: string;
  visitDate: string;
  doctorRating: number;
  staffRating: number;
  waitRating: number;
  comment: string;
  googleReviewPrompted: boolean;
}

const pendingFeedbackData: PendingFeedback[] = [
  {
    id: "pf-1",
    doctor: "Dr. Priya Sharma",
    doctorInitials: "PS",
    clinic: "CliniqAI Health Center",
    visitDate: "2026-03-11",
  },
  {
    id: "pf-2",
    doctor: "Dr. Rohit Mehta",
    doctorInitials: "RM",
    clinic: "CliniqAI Cardiology",
    visitDate: "2026-03-09",
  },
];

const completedFeedbackData: CompletedFeedback[] = [
  {
    id: "cf-1",
    doctor: "Dr. Sunil Verma",
    doctorInitials: "SV",
    clinic: "CliniqAI Health Center",
    visitDate: "2026-02-28",
    doctorRating: 5,
    staffRating: 4,
    waitRating: 3,
    comment: "Dr. Verma was extremely thorough and took time to explain everything. Slightly long wait but worth it.",
    googleReviewPrompted: true,
  },
  {
    id: "cf-2",
    doctor: "Dr. Anita Desai",
    doctorInitials: "AD",
    clinic: "CliniqAI Kids Clinic",
    visitDate: "2026-02-20",
    doctorRating: 5,
    staffRating: 5,
    waitRating: 4,
    comment: "Wonderful experience for my son. Dr. Desai is fantastic with children. Very patient and caring.",
    googleReviewPrompted: false,
  },
  {
    id: "cf-3",
    doctor: "Dr. Kavita Rao",
    doctorInitials: "KR",
    clinic: "CliniqAI Ortho Clinic",
    visitDate: "2026-02-10",
    doctorRating: 4,
    staffRating: 4,
    waitRating: 5,
    comment: "Quick consultation with clear advice on physiotherapy exercises. No wait time at all.",
    googleReviewPrompted: true,
  },
];

function StarRatingDisplay({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const iconSize = size === "md" ? "h-5 w-5" : "h-3.5 w-3.5";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${iconSize} ${
            star <= rating
              ? "text-yellow-400 fill-yellow-400"
              : "text-muted-foreground"
          }`}
        />
      ))}
    </div>
  );
}

function InteractiveStarRating({
  rating,
  onRate,
  label,
}: {
  rating: number;
  onRate: (value: number) => void;
  label: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRate(star)}
            className="cursor-pointer p-0.5 transition-transform hover:scale-110"
          >
            <Star
              className={`h-6 w-6 ${
                star <= rating
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-muted-foreground"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function FeedbackPage() {
  const [expandedFeedback, setExpandedFeedback] = useState<string | null>(null);
  const [ratings, setRatings] = useState<Record<string, { doctor: number; staff: number; wait: number; comment: string }>>({});

  function getRating(id: string) {
    return ratings[id] || { doctor: 0, staff: 0, wait: 0, comment: "" };
  }

  function updateRating(id: string, field: "doctor" | "staff" | "wait", value: number) {
    setRatings((prev) => ({
      ...prev,
      [id]: { ...getRating(id), [field]: value },
    }));
  }

  function updateComment(id: string, comment: string) {
    setRatings((prev) => ({
      ...prev,
      [id]: { ...getRating(id), comment },
    }));
  }

  const avgDoctorRating =
    completedFeedbackData.reduce((sum, f) => sum + f.doctorRating, 0) /
    completedFeedbackData.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight section-header">Feedback</h1>
        <p className="text-muted-foreground">Rate your visits and help us improve your experience</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Pending Reviews"
          value={pendingFeedbackData.length}
          icon={Clock}
          color="amber"
          delay={0}
        />
        <StatCard
          title="Reviews Given"
          value={completedFeedbackData.length}
          icon={MessageSquare}
          color="primary"
          delay={100}
        />
        <StatCard
          title="Avg Doctor Rating"
          value={avgDoctorRating.toFixed(1)}
          icon={Star}
          color="emerald"
          delay={200}
        />
        <StatCard
          title="Google Reviews"
          value={completedFeedbackData.filter((f) => f.googleReviewPrompted).length}
          icon={ThumbsUp}
          color="violet"
          delay={300}
        />
      </div>

      {/* Pending Feedback */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Pending Feedback</h2>
        <div className="grid gap-4">
          {pendingFeedbackData.map((item) => {
            const isExpanded = expandedFeedback === item.id;
            const currentRating = getRating(item.id);

            return (
              <Card key={item.id} className="animate-fade-in-up">
                <CardContent className="p-5 space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {item.doctorInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{item.doctor}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {item.clinic}
                          </span>
                          <span className="flex items-center gap-1">
                            <CalendarDays className="h-3 w-3" />
                            {new Date(item.visitDate).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    >
                      Pending
                    </Badge>
                  </div>

                  {!isExpanded && (
                    <Button
                      className="cursor-pointer w-full"
                      onClick={() => setExpandedFeedback(item.id)}
                    >
                      <Star className="h-4 w-4 mr-1.5" />
                      Rate This Visit
                    </Button>
                  )}

                  {isExpanded && (
                    <>
                      <Separator />
                      <div className="space-y-4">
                        <InteractiveStarRating
                          label="Doctor Rating"
                          rating={currentRating.doctor}
                          onRate={(v) => updateRating(item.id, "doctor", v)}
                        />
                        <InteractiveStarRating
                          label="Staff Rating"
                          rating={currentRating.staff}
                          onRate={(v) => updateRating(item.id, "staff", v)}
                        />
                        <InteractiveStarRating
                          label="Wait Experience"
                          rating={currentRating.wait}
                          onRate={(v) => updateRating(item.id, "wait", v)}
                        />
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Comments (Optional)</label>
                          <Textarea
                            placeholder="Share your experience..."
                            value={currentRating.comment}
                            onChange={(e) => updateComment(item.id, e.target.value)}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button className="cursor-pointer flex-1">
                            <Send className="h-4 w-4 mr-1.5" />
                            Submit Feedback
                          </Button>
                          <Button
                            variant="outline"
                            className="cursor-pointer"
                            onClick={() => setExpandedFeedback(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Past Feedback */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Past Feedback</h2>
        <div className="grid gap-4">
          {completedFeedbackData.map((item) => (
            <Card key={item.id} className="animate-fade-in-up">
              <CardContent className="p-5 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                        {item.doctorInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{item.doctor}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {item.clinic}
                        </span>
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />
                          {new Date(item.visitDate).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.googleReviewPrompted && (
                      <Badge
                        variant="secondary"
                        className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Google Review
                      </Badge>
                    )}
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    >
                      Submitted
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Doctor</p>
                    <StarRatingDisplay rating={item.doctorRating} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Staff</p>
                    <StarRatingDisplay rating={item.staffRating} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Wait Experience</p>
                    <StarRatingDisplay rating={item.waitRating} />
                  </div>
                </div>

                {item.comment && (
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-sm text-muted-foreground italic">&ldquo;{item.comment}&rdquo;</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
