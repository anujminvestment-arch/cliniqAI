"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send, Bot, User, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { voice } from "@/lib/api";

interface Message {
  role: "user" | "ai";
  content: string;
}

interface SimResult {
  doctors?: Array<{
    name: string;
    specialization: string;
    fee: number;
    queue_length: number;
    estimated_wait: number;
  }>;
  appointment_code?: string;
  token_number?: number;
  queue_length?: number;
  patient_position?: number;
  name?: string;
  answer?: string;
  [key: string]: unknown;
}

export default function AITestPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [clinicId, setClinicId] = useState("");

  async function handleSend() {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setInput("");
    setLoading(true);

    try {
      // Determine action from message
      const lower = userMessage.toLowerCase();
      let action = "search_doctors";
      let params: Record<string, unknown> = {};

      if (lower.includes("book") || lower.includes("appointment")) {
        action = "book_appointment";
        params = {
          doctor_id: "placeholder",
          patient_phone: "+919812345001",
          patient_name: "Test Patient",
          date: new Date().toISOString().split("T")[0],
          start_time: "14:00",
          symptoms: userMessage,
        };
      } else if (lower.includes("queue") || lower.includes("wait")) {
        action = "check_queue";
        params = {};
      } else if (lower.includes("timing") || lower.includes("parking") || lower.includes("address")) {
        action = "clinic_info";
        params = { query: userMessage };
      } else {
        // Default: search doctors by symptoms
        const symptoms = userMessage.split(",").map((s) => s.trim());
        params = { symptoms };
      }

      const result = (await voice.simulate(
        clinicId || "00000000-0000-0000-0000-000000000000",
        action,
        params
      )) as SimResult;

      // Format response
      let aiResponse = JSON.stringify(result, null, 2);

      if (result.doctors && Array.isArray(result.doctors)) {
        aiResponse = result.doctors
          .map(
            (d) =>
              `Dr. ${d.name} (${d.specialization}) — Rs ${d.fee}, Queue: ${d.queue_length}, Wait: ${d.estimated_wait} min`
          )
          .join("\n");
      } else if (result.appointment_code) {
        aiResponse = `Appointment booked! Code: ${result.appointment_code}, Token: #${result.token_number}`;
      } else if (result.queue_length !== undefined) {
        aiResponse = `Queue: ${result.queue_length} patients${
          result.patient_position
            ? `, Your position: #${result.patient_position}`
            : ""
        }`;
      } else if (result.answer) {
        aiResponse = result.answer;
      }

      setMessages((prev) => [...prev, { role: "ai", content: aiResponse }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: `Error: ${
            err instanceof Error ? err.message : "Failed to process. Is the Python backend running?"
          }`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Link
        href="/clinic/ai-settings"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to AI Settings
      </Link>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Test AI Voice Receptionist
        </h1>
        <p className="text-muted-foreground text-sm">
          Simulate voice calls without real telephony. Type symptoms, questions,
          or commands.
        </p>
      </div>

      {/* Clinic ID input */}
      <div className="flex gap-2 items-center">
        <span className="text-sm text-muted-foreground whitespace-nowrap">Clinic ID:</span>
        <Input
          placeholder="Paste clinic UUID from database"
          value={clinicId}
          onChange={(e) => setClinicId(e.target.value)}
          className="font-mono text-xs"
        />
      </div>

      {/* Hints */}
      <div className="flex flex-wrap gap-2">
        {["tooth pain", "fever, headache", "check queue", "clinic timings"].map(
          (hint) => (
            <Badge
              key={hint}
              variant="outline"
              className="cursor-pointer hover:bg-muted"
              onClick={() => setInput(hint)}
            >
              {hint}
            </Badge>
          )
        )}
      </div>

      {/* Chat area */}
      <Card className="min-h-[400px] flex flex-col">
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-20">
              <Bot className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">
                Type a symptom like &quot;tooth pain&quot; to see doctor
                suggestions
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${
                msg.role === "user" ? "flex-row-reverse" : ""
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
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                  msg.role === "ai"
                    ? "bg-muted"
                    : "bg-primary text-primary-foreground"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
              <div className="bg-muted rounded-2xl px-4 py-2.5 text-sm text-muted-foreground">
                Processing...
              </div>
            </div>
          )}
        </CardContent>

        {/* Input */}
        <div className="border-t p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <Input
              placeholder="Type symptoms, questions, or commands..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <Button type="submit" size="icon" disabled={loading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
