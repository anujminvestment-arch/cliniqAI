"use client";

import { useState, useEffect } from "react";
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
import { Spinner } from "@/components/shared/spinner";
import { feedback as feedbackApi } from "@/lib/api";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";

const ratingToSentiment = (rating: number): string => {
  if (rating >= 4) return "Positive";
  if (rating >= 3) return "Neutral";
  return "Negative";
};

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

interface FeedbackRecord {
  id: string;
  patient_name: string;
  rating: number;
  comment: string;
  category: string;
  created_at: string;
}

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
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [feedbackRecords, setFeedbackRecords] = useState<FeedbackRecord[]>([]);
  const [avgRating, setAvgRating] = useState<number>(0);
  const [loading, setLoading] = useState(true);

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

  const categories = [...new Set(feedbackRecords.map((f) => f.category).filter(Boolean))];

  const filtered = feedbackRecords.filter((fb) => {
    const matchesSearch =
      fb.patient_name.toLowerCase().includes(search.toLowerCase()) ||
      fb.comment.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || fb.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalRecords = feedbackRecords.length;
  const positiveCount = feedbackRecords.filter((f) => f.rating >= 4).length;
  const positiveRate = totalRecords > 0 ? Math.round((positiveCount / totalRecords) * 100) : 0;

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
          <BreadcrumbItem><BreadcrumbLink href="/clinic">Dashboard</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>Feedback</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div>
        <h1 className="text-2xl font-bold tracking-tight section-header">Patient Feedback</h1>
        <p className="text-muted-foreground">Ratings, reviews, and patient satisfaction insights</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Feedback"
          value={totalRecords}
          icon={BarChart3}
          color="primary"
        />
        <StatCard
          title="Avg Rating"
          value={`${avgRating.toFixed(1)}/5`}
          icon={Star}
          color="amber"
        />
        <StatCard
          title="Positive Rate"
          value={`${positiveRate}%`}
          icon={Users}
          color="emerald"
        />
        <StatCard
          title="Responses"
          value={totalRecords}
          icon={MessageSquare}
          color="violet"
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
              {categories.length > 0 && (
                <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v ?? "all")}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto scrollbar-thin">
            <Table className="table-enhanced">
              <TableHeader>
                <TableRow>
                  <TableHead>Patient Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead className="max-w-[200px]">Comment</TableHead>
                  <TableHead>Sentiment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((fb) => {
                  const sentiment = ratingToSentiment(fb.rating);
                  const SentimentIcon = sentimentIcons[sentiment];
                  return (
                    <TableRow key={fb.id}>
                      <TableCell className="font-medium">{fb.patient_name}</TableCell>
                      <TableCell className="text-muted-foreground">{fb.category}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(fb.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell>
                        <StarRating rating={fb.rating} />
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <p className="text-sm text-muted-foreground truncate" title={fb.comment}>
                          {fb.comment}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={sentimentColors[sentiment]}>
                          <SentimentIcon className="h-3 w-3 mr-1" />
                          {sentiment}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No feedback found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
