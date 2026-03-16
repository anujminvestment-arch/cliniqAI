"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Phone, Clock, User, Bot, Play, Pause } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { conversations as conversationsApi } from "@/lib/api";

interface ConversationDetail {
  id: string;
  channel: string;
  caller_phone: string | null;
  duration: number | null;
  recording_url: string | null;
  transcript: string | null;
  ai_summary: string | null;
  created_at: string | null;
  patient_name: string | null;
  messages: Array<{ id: string; role: string; content: string; timestamp: string | null }>;
  extractions: Array<{ id: string; type: string; data: Record<string, unknown> }>;
}

export default function PatientConversationDetailPage() {
  const params = useParams();
  const [data, setData] = useState<ConversationDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      conversationsApi
        .getById(params.id as string)
        .then(setData)
        .catch(() => setData(null))
        .finally(() => setLoading(false));
    }
  }, [params.id]);

  function formatDuration(seconds: number | null) {
    if (!seconds) return "—";
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  }

  if (loading) {
    return <div className="py-20 text-center text-muted-foreground">Loading...</div>;
  }

  if (!data) {
    return (
      <div className="space-y-4">
        <Link href="/patient/conversations" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <Card><CardContent className="py-12 text-center text-muted-foreground">Conversation not found</CardContent></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/patient/conversations" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Conversations
      </Link>

      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold">Conversation</h1>
        <Badge variant="outline" className="capitalize">{data.channel}</Badge>
        <span className="text-sm text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" /> {formatDuration(data.duration)}
        </span>
        <span className="text-sm text-muted-foreground ml-auto">
          {data.created_at ? new Date(data.created_at).toLocaleString("en-IN") : ""}
        </span>
      </div>

      {data.ai_summary && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Bot className="h-4 w-4 text-primary" /> Summary
            </CardTitle>
          </CardHeader>
          <CardContent><p className="text-sm">{data.ai_summary}</p></CardContent>
        </Card>
      )}

      {data.recording_url && (
        <Card>
          <CardContent className="py-3">
            <audio src={data.recording_url} controls className="w-full h-8" />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-sm font-medium">Transcript</CardTitle></CardHeader>
        <CardContent>
          {data.messages.length > 0 ? (
            <div className="space-y-4">
              {data.messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.role === "ai" ? "" : "flex-row-reverse"}`}>
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${msg.role === "ai" ? "bg-primary/10 text-primary" : "bg-muted"}`}>
                    {msg.role === "ai" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  </div>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${msg.role === "ai" ? "bg-muted" : "bg-primary text-primary-foreground"}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
          ) : data.transcript ? (
            <p className="text-sm whitespace-pre-wrap">{data.transcript}</p>
          ) : (
            <p className="text-sm text-muted-foreground">No transcript available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
