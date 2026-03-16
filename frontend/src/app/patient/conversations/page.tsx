"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Phone, MessageSquare, Clock, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { conversations as conversationsApi } from "@/lib/api";

interface ConversationItem {
  id: string;
  channel: string;
  duration: number | null;
  ai_summary: string | null;
  created_at: string | null;
}

export default function PatientConversationsPage() {
  const [items, setItems] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    conversationsApi
      .list()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  function formatDuration(seconds: number | null) {
    if (!seconds) return "—";
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Conversations</h1>
        <p className="text-muted-foreground">
          Your voice calls and chat history with the clinic
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          Loading...
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Phone className="h-8 w-8 mx-auto mb-3 opacity-50" />
            <p>No conversations yet.</p>
            <p className="text-sm mt-1">
              Call the clinic or chat via WhatsApp — your conversations will
              appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((conv) => (
            <Link key={conv.id} href={`/patient/conversations/${conv.id}`}>
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                <CardContent className="flex items-center gap-4 py-4">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      conv.channel === "voice"
                        ? "bg-primary/10 text-primary"
                        : "bg-accent/10 text-accent"
                    }`}
                  >
                    {conv.channel === "voice" ? (
                      <Phone className="h-5 w-5" />
                    ) : (
                      <MessageSquare className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize text-xs">
                        {conv.channel}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDuration(conv.duration)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 truncate">
                      {conv.ai_summary || "No summary available"}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap">
                    {conv.created_at
                      ? new Date(conv.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })
                      : "—"}
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
