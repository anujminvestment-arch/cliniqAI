"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Phone, PhoneOff, Mic, MicOff, Volume2, Send, Bot,
  Stethoscope, Clock, MapPin, ArrowLeft, MessageSquare,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/shared/spinner";
import { useAuth } from "@/lib/auth-context";
import { clinics } from "@/lib/api";

// Auth context returns flat state (user, membership, etc.) not nested
import {
  Breadcrumb, BreadcrumbList, BreadcrumbItem,
  BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage,
} from "@/components/ui/breadcrumb";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const WS_BASE = API_BASE.replace(/^http/, "ws");

type CallState = "options" | "connecting" | "calling" | "ended";
type AiState = "listening" | "processing" | "speaking";
type Message = { role: "user" | "ai"; text: string };

export default function PatientVoiceCallPage() {
  const auth = useAuth();
  const [callState, setCallState] = useState<CallState>("options");
  const [aiState, setAiState] = useState<AiState>("listening");
  const [transcript, setTranscript] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [clinicInfo, setClinicInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Fetch clinic info on mount
  useEffect(() => {
    async function fetchClinic() {
      try {
        const res = await clinics.getMe();
        setClinicInfo(res);
      } catch (err) {
        console.error("Failed to fetch clinic:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchClinic();
  }, []);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  // ── WebSocket Connection ─────────────────────────────────
  const startCall = useCallback(async () => {
    if (!clinicInfo?.id) return;
    setCallState("connecting");
    setTranscript([]);

    const wsUrl = `${WS_BASE}/api/voice-call/ws/${clinicInfo.id}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setCallState("calling");
      setAiState("speaking");
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      switch (msg.type) {
        case "response":
          setTranscript((prev) => [...prev, { role: "ai", text: msg.text }]);
          break;
        case "transcript":
          setTranscript((prev) => [...prev, { role: "user", text: msg.text }]);
          break;
        case "state":
          setAiState(msg.state);
          break;
        case "audio":
          playAudio(msg.data, msg.format);
          break;
      }
    };

    ws.onclose = () => {
      setCallState("ended");
      cleanupRecording();
    };

    ws.onerror = () => setCallState("ended");
  }, [clinicInfo]);

  // ── Audio Playback ───────────────────────────────────────
  const playAudio = async (base64Audio: string, format: string) => {
    try {
      setAiState("speaking");
      const bytes = Uint8Array.from(atob(base64Audio), (c) => c.charCodeAt(0));
      const blob = new Blob([bytes], { type: `audio/${format || "mp3"}` });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => {
        setAiState("listening");
        URL.revokeObjectURL(url);
      };
      await audio.play();
    } catch {
      setAiState("listening");
    }
  };

  // ── Recording ────────────────────────────────────────────
  const startRecording = useCallback(async () => {
    if (aiState === "speaking") return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 16000 },
      });
      streamRef.current = stream;

      // Try opus first, fallback to default
      let mimeType = "audio/webm;codecs=opus";
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = "audio/webm";
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = "";
        }
      }

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        if (audioChunksRef.current.length === 0) return;
        const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType || "audio/webm" });

        // Convert to base64 and send via WebSocket
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(",")[1];
          if (wsRef.current?.readyState === WebSocket.OPEN && base64) {
            wsRef.current.send(JSON.stringify({
              type: "audio",
              data: base64,
              format: "webm",
            }));
          }
        };
        reader.readAsDataURL(blob);

        // Cleanup stream tracks
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      };

      recorder.start(100); // Collect chunks every 100ms
      setIsRecording(true);
    } catch (err) {
      console.error("Mic error:", err);
      alert("Microphone access denied. Please allow mic permission or use the text input.");
    }
  }, [aiState]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  }, []);

  const cleanupRecording = () => {
    stopRecording();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  // ── Text Message ─────────────────────────────────────────
  const sendText = useCallback(() => {
    const text = textInput.trim();
    if (!text || wsRef.current?.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ type: "text", data: text }));
    setTextInput("");
  }, [textInput]);

  const endCall = useCallback(() => {
    wsRef.current?.close();
    cleanupRecording();
    setCallState("ended");
  }, []);

  // ── Loading ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/patient">Dashboard</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>AI Voice Assistant</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Voice Assistant</h1>
        <p className="text-muted-foreground mt-1">Talk to our AI receptionist to book appointments, check queue, and more.</p>
      </div>

      {/* ── OPTIONS STATE: Show clinic + 2 contact methods ──── */}
      {callState === "options" && (
        <div className="space-y-6">
          {/* Clinic Info Card */}
          {clinicInfo && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <Stethoscope className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>{clinicInfo.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1.5 mt-0.5">
                      <MapPin className="h-3.5 w-3.5" />
                      {clinicInfo.address || "Clinic Address"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              {clinicInfo.timings && (
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>
                      {Object.entries(clinicInfo.timings).slice(0, 1).map(([day, hours]: [string, any]) =>
                        `${hours.open} - ${hours.close}`
                      ).join("")}
                      {" (Mon-Fri)"}
                    </span>
                  </div>
                </CardContent>
              )}
            </Card>
          )}

          {/* Contact Options */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Option 1: Phone Call */}
            <Card className="group hover:ring-2 hover:ring-primary/30 transition-all cursor-pointer"
                  onClick={() => { if (clinicInfo?.phone) window.location.href = `tel:${clinicInfo.phone}`; }}>
              <CardContent className="flex flex-col items-center text-center py-8 space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
                  <Phone className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Call Clinic</h3>
                  <p className="text-sm text-muted-foreground mt-1">Speak to our AI receptionist via phone</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg">
                  <Phone className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-mono text-lg font-semibold text-emerald-700 dark:text-emerald-300">
                    {clinicInfo?.phone || "+91-80-XXXX-XXXX"}
                  </span>
                </div>
                <Badge variant="outline" className="text-xs">Exotel / Twilio Powered</Badge>
              </CardContent>
            </Card>

            {/* Option 2: WebRTC Voice */}
            <Card className="group hover:ring-2 hover:ring-primary/30 transition-all cursor-pointer"
                  onClick={startCall}>
              <CardContent className="flex flex-col items-center text-center py-8 space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Bot className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Talk to AI Online</h3>
                  <p className="text-sm text-muted-foreground mt-1">Voice call via browser — no phone needed</p>
                </div>
                <Button size="lg" className="gap-2">
                  <Mic className="h-4 w-4" />
                  Start Voice Call
                </Button>
                <Badge variant="outline" className="text-xs">Free &middot; WebRTC Powered</Badge>
              </CardContent>
            </Card>
          </div>

          {/* What can AI do */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">What can the AI receptionist do?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 text-sm">
                {[
                  "Book appointments with the right doctor",
                  "Check your queue position & wait time",
                  "Suggest doctors based on your symptoms",
                  "Answer clinic timing & location questions",
                  "Cancel or reschedule appointments",
                  "Share doctor fees & availability",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="mt-0.5 h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs text-primary font-medium">{i + 1}</span>
                    </div>
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── CONNECTING STATE ────────────────────────────────── */}
      {callState === "connecting" && (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <div className="relative">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="h-10 w-10 text-primary animate-pulse" />
            </div>
            <div className="absolute inset-0 h-20 w-20 rounded-full border-2 border-primary/30 animate-ping" />
          </div>
          <p className="text-lg font-medium">Connecting to AI Receptionist...</p>
          <p className="text-sm text-muted-foreground">Please allow microphone access when prompted</p>
        </div>
      )}

      {/* ── CALLING STATE ───────────────────────────────────── */}
      {callState === "calling" && (
        <div className="space-y-4">
          {/* Status Bar */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
              <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                {aiState === "listening" ? "Listening..." : aiState === "processing" ? "Thinking..." : "Speaking..."}
              </span>
            </div>
            <Button variant="destructive" size="sm" onClick={endCall} className="gap-1.5">
              <PhoneOff className="h-4 w-4" />
              End Call
            </Button>
          </div>

          {/* Transcript */}
          <Card className="min-h-[350px] max-h-[450px] overflow-hidden flex flex-col">
            <CardContent className="flex-1 overflow-y-auto space-y-3 py-4">
              {transcript.length === 0 && (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  <Spinner size="sm" />
                  <span className="ml-2">Waiting for AI greeting...</span>
                </div>
              )}
              {transcript.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted text-foreground rounded-bl-md"
                  }`}>
                    {msg.role === "ai" && (
                      <div className="flex items-center gap-1.5 mb-1 text-xs opacity-60">
                        <Bot className="h-3 w-3" /> AI Receptionist
                      </div>
                    )}
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={transcriptEndRef} />
            </CardContent>
          </Card>

          {/* Controls */}
          <Card>
            <CardContent className="flex items-center gap-3 py-3">
              {/* Mic Button */}
              <Button
                size="icon"
                variant={isRecording ? "destructive" : "default"}
                className={`h-12 w-12 rounded-full flex-shrink-0 transition-all ${isRecording ? "scale-110 shadow-lg" : ""}`}
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                onTouchStart={startRecording}
                onTouchEnd={stopRecording}
                disabled={aiState === "speaking"}
              >
                {isRecording ? <Mic className="h-5 w-5 animate-pulse" /> : <Mic className="h-5 w-5" />}
              </Button>
              <span className="text-xs text-muted-foreground flex-shrink-0">
                {isRecording ? "Release to send" : "Hold to speak"}
              </span>

              <Separator orientation="vertical" className="h-8" />

              {/* Text Input */}
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") sendText(); }}
                  placeholder="Or type your message..."
                  className="flex-1 px-3 py-2 text-sm border rounded-lg bg-background"
                  disabled={aiState === "speaking"}
                />
                <Button size="icon" onClick={sendText} disabled={!textInput.trim()} className="flex-shrink-0">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            {["dant me dard hai", "bukhar hai", "appointment book karo", "queue status", "clinic timing"].map((q) => (
              <button
                key={q}
                onClick={() => {
                  if (wsRef.current?.readyState === WebSocket.OPEN) {
                    wsRef.current.send(JSON.stringify({ type: "text", data: q }));
                  }
                }}
                className="px-3 py-1.5 text-xs rounded-full border bg-background hover:bg-muted transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── ENDED STATE ─────────────────────────────────────── */}
      {callState === "ended" && (
        <div className="space-y-6">
          <Card className="text-center">
            <CardContent className="py-8 space-y-4">
              <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-muted">
                <PhoneOff className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Call Ended</h2>
                <p className="text-muted-foreground mt-1">Thank you for using CliniqAI Voice Assistant.</p>
              </div>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => { setCallState("options"); setTranscript([]); }} variant="outline" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Options
                </Button>
                <Button onClick={() => { setCallState("connecting"); startCall(); }} className="gap-2">
                  <Phone className="h-4 w-4" />
                  Call Again
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Transcript */}
          {transcript.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Call Transcript
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-[300px] overflow-y-auto">
                {transcript.map((msg, i) => (
                  <div key={i} className="text-sm py-1">
                    <span className={`font-medium ${msg.role === "user" ? "text-primary" : "text-emerald-600 dark:text-emerald-400"}`}>
                      {msg.role === "user" ? "You: " : "AI: "}
                    </span>
                    <span className="text-muted-foreground">{msg.text}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
