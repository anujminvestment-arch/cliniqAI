"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Phone,
  Clock,
  User,
  Bot,
  Play,
  Pause,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { conversations as conversationsApi } from "@/lib/api";

interface Message {
  id: string;
  role: string;
  content: string;
  timestamp: string | null;
}

interface Extraction {
  id: string;
  type: string;
  data: Record<string, unknown>;
  confidence: number | null;
}

interface ConversationDetail {
  id: string;
  channel: string;
  caller_phone: string | null;
  duration: number | null;
  recording_url: string | null;
  transcript: string | null;
  ai_summary: string | null;
  sentiment: string | null;
  created_at: string | null;
  patient_name: string | null;
  messages: Message[];
  extractions: Extraction[];
}

export default function ConversationDetailPage() {
  const params = useParams();
  const [data, setData] = useState<ConversationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadConversation(params.id as string);
    }
  }, [params.id]);

  async function loadConversation(id: string) {
    try {
      const conv = await conversationsApi.getById(id);
      setData(conv);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  function formatDuration(seconds: number | null) {
    if (!seconds) return "—";
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}m ${sec}s`;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Loading conversation...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-4">
        <Link
          href="/clinic/conversations"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Conversations
        </Link>
        <Card>
          <CardContent className="py-20 text-center text-muted-foreground">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            Conversation not found
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/clinic/conversations"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Conversations
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {data.patient_name || "Unknown Patient"}
          </h1>
          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {data.caller_phone || "—"}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDuration(data.duration)}
            </span>
            <Badge variant="outline" className="capitalize">
              {data.channel}
            </Badge>
            {data.sentiment && (
              <Badge
                variant={
                  data.sentiment === "positive"
                    ? "default"
                    : data.sentiment === "negative"
                    ? "destructive"
                    : "secondary"
                }
              >
                {data.sentiment}
              </Badge>
            )}
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          {data.created_at
            ? new Date(data.created_at).toLocaleString("en-IN")
            : "—"}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Transcript */}
        <div className="lg:col-span-2 space-y-4">
          {/* AI Summary */}
          {data.ai_summary && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Bot className="h-4 w-4 text-primary" />
                  AI Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{data.ai_summary}</p>
              </CardContent>
            </Card>
          )}

          {/* Recording Player */}
          {data.recording_url && (
            <Card>
              <CardContent className="py-3">
                <div className="flex items-center gap-3">
                  <Button
                    size="icon"
                    variant="outline"
                    className="shrink-0"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  <div className="flex-1">
                    <audio
                      src={data.recording_url}
                      controls
                      className="w-full h-8"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Chat-style transcript */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Transcript</CardTitle>
            </CardHeader>
            <CardContent>
              {data.messages.length > 0 ? (
                <div className="space-y-4">
                  {data.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${
                        msg.role === "ai" ? "" : "flex-row-reverse"
                      }`}
                    >
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                          msg.role === "ai"
                            ? "bg-primary/10 text-primary"
                            : "bg-muted"
                        }`}
                      >
                        {msg.role === "ai" ? (
                          <Bot className="h-4 w-4" />
                        ) : (
                          <User className="h-4 w-4" />
                        )}
                      </div>
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                          msg.role === "ai"
                            ? "bg-muted"
                            : "bg-primary text-primary-foreground"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                </div>
              ) : data.transcript ? (
                <p className="text-sm whitespace-pre-wrap">{data.transcript}</p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No transcript available
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Extractions */}
        <div className="space-y-4">
          {data.extractions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Extracted Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.extractions.map((ext) => (
                  <div key={ext.id}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {ext.type.replace("_", " ")}
                      </span>
                      {ext.confidence && (
                        <span className="text-xs text-muted-foreground">
                          {ext.confidence}% confidence
                        </span>
                      )}
                    </div>
                    <div className="rounded-lg bg-muted p-3 text-sm">
                      {Object.entries(ext.data).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-muted-foreground capitalize">
                            {key}:
                          </span>
                          <span className="font-medium">
                            {Array.isArray(value)
                              ? value.join(", ")
                              : String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <Separator className="mt-3" />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Channel</span>
                <span className="capitalize">{data.channel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration</span>
                <span>{formatDuration(data.duration)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phone</span>
                <span>{data.caller_phone || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span>
                  {data.created_at
                    ? new Date(data.created_at).toLocaleDateString("en-IN")
                    : "—"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
