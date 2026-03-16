"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Phone,
  MessageSquare,
  Clock,
  Search,
  Filter,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { conversations as conversationsApi } from "@/lib/api";

interface ConversationItem {
  id: string;
  channel: string;
  caller_phone: string | null;
  duration: number | null;
  ai_summary: string | null;
  sentiment: string | null;
  created_at: string | null;
  patient_name: string | null;
  patient_phone: string | null;
}

export default function ClinicConversationsPage() {
  const [items, setItems] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState<string>("all");

  useEffect(() => {
    loadConversations();
  }, [channelFilter]);

  async function loadConversations() {
    try {
      setLoading(true);
      const data = await conversationsApi.list({
        channel: channelFilter === "all" ? undefined : channelFilter,
        search: search || undefined,
      });
      setItems(data);
    } catch {
      // API not yet connected — show empty state
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch() {
    loadConversations();
  }

  function formatDuration(seconds: number | null) {
    if (!seconds) return "—";
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  }

  function formatDate(iso: string | null) {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const channelIcon = (ch: string) =>
    ch === "voice" ? <Phone className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />;

  const sentimentColor = (s: string | null) => {
    if (!s) return "secondary";
    if (s === "positive") return "default";
    if (s === "negative") return "destructive";
    return "secondary";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Conversations</h1>
        <p className="text-muted-foreground">
          All voice calls and chat conversations with patients
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <Select value={channelFilter} onValueChange={(v) => setChannelFilter(v ?? "all")}>
          <SelectTrigger className="w-40">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Channel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Channels</SelectItem>
            <SelectItem value="voice">Voice Calls</SelectItem>
            <SelectItem value="whatsapp">WhatsApp</SelectItem>
            <SelectItem value="web">Web Chat</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead className="max-w-[300px]">AI Summary</TableHead>
                <TableHead>Sentiment</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Loading conversations...
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No conversations yet. Conversations will appear here once the AI voice receptionist handles calls.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((conv) => (
                  <TableRow key={conv.id}>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(conv.created_at)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {conv.patient_name || "Unknown"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {conv.caller_phone || conv.patient_phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {channelIcon(conv.channel)}
                        <span className="capitalize text-sm">{conv.channel}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        {formatDuration(conv.duration)}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate text-sm text-muted-foreground">
                      {conv.ai_summary || "—"}
                    </TableCell>
                    <TableCell>
                      {conv.sentiment && (
                        <Badge variant={sentimentColor(conv.sentiment)}>
                          {conv.sentiment}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/clinic/conversations/${conv.id}`}
                        className="inline-flex items-center text-sm text-primary hover:underline"
                      >
                        View
                        <ChevronRight className="h-3 w-3 ml-1" />
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
