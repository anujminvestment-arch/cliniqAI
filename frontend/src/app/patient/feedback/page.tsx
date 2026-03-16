"use client";

import { useState, useEffect } from "react";
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
import { Spinner } from "@/components/shared/spinner";
import { feedback as feedbackApi } from "@/lib/api";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";

interface FeedbackRecord {
  id: string;
  patient_name: string;
  rating: number;
  comment: string;
  category: string;
  created_at: string;
}

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
  const [feedbackRecords, setFeedbackRecords] = useState<FeedbackRecord[]>([]);
  const [avgRating, setAvgRating] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);

  useEffect(() => {
    feedbackApi
      .list()
      .then((data) => {
        setFeedbackRecords(data.feedback ?? []);
        setAvgRating(data.avg_rating ?? 0);
      })
      .catch(() => {
        setFeedbackRecords([]);
        setAvgRating(0);
      })
      .finally(() => setLoading(false));
  }, []);

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

  async function handleSubmit(id: string) {
    const r = getRating(id);
    if (r.doctor === 0) return;
    setSubmitting(id);
    try {
      await feedbackApi.submit({
        rating: r.doctor,
        comment: r.comment,
        category: "visit",
      });
      // Refresh list after submission
      const data = await feedbackApi.list();
      setFeedbackRecords(data.feedback ?? []);
      setAvgRating(data.avg_rating ?? 0);
      setExpandedFeedback(null);
      // Clear rating state for this item
      setRatings((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } catch {
      // submission failed silently
    } finally {
      setSubmitting(null);
    }
  }

  // Separate records into those with low ratings (could represent "pending") and completed
  const completedRecords = feedbackRecords.filter((f) => f.rating > 0);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/patient">Dashboard</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>Feedback</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div>
        <h1 className="text-2xl font-bold tracking-tight section-header">Feedback</h1>
        <p className="text-muted-foreground">Rate your visits and help us improve your experience</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Reviews"
          value={completedRecords.length}
          icon={MessageSquare}
          color="primary"
          delay={100}
        />
        <StatCard
          title="Avg Rating"
          value={avgRating > 0 ? avgRating.toFixed(1) : "—"}
          icon={Star}
          color="emerald"
          delay={200}
        />
        <StatCard
          title="Positive Reviews"
          value={completedRecords.filter((f) => f.rating >= 4).length}
          icon={ThumbsUp}
          color="violet"
          delay={300}
        />
        <StatCard
          title="Categories"
          value={[...new Set(completedRecords.map((f) => f.category).filter(Boolean))].length}
          icon={Clock}
          color="amber"
          delay={0}
        />
      </div>

      {/* Past Feedback */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Your Feedback</h2>
        <div className="grid gap-4">
          {completedRecords.length === 0 && (
            <Card>
              <CardContent className="p-5 text-center text-muted-foreground">
                No feedback submitted yet.
              </CardContent>
            </Card>
          )}
          {completedRecords.map((item) => {
            const initials = item.patient_name
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();
            return (
              <Card key={item.id} className="animate-fade-in-up">
                <CardContent className="p-5 space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{item.category || "Visit"}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                          <span className="flex items-center gap-1">
                            <CalendarDays className="h-3 w-3" />
                            {new Date(item.created_at).toLocaleDateString("en-IN", {
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
                      className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    >
                      Submitted
                    </Badge>
                  </div>

                  <Separator />

                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Rating</p>
                    <StarRatingDisplay rating={item.rating} />
                  </div>

                  {item.comment && (
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-sm text-muted-foreground italic">&ldquo;{item.comment}&rdquo;</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
