"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Phone, PhoneOff, Mic, MicOff, Volume2 } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const WS_BASE = API_BASE.replace(/^http/, "ws");

export default function VoiceCallPage() {
  const [callState, setCallState] = useState<"idle" | "connecting" | "calling" | "ended">("idle");
  const [aiState, setAiState] = useState<"listening" | "processing" | "speaking">("listening");
  const [clinicSlug, setClinicSlug] = useState("city-dental-bangalore");
  const [transcript, setTranscript] = useState<Array<{ role: "user" | "ai"; text: string }>>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [textInput, setTextInput] = useState("");
  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  const startCall = useCallback(async () => {
    setCallState("connecting");
    setTranscript([]);

    // Validate clinic exists via TV endpoint
    try {
      const res = await fetch(`${API_BASE}/api/queue/tv/${clinicSlug}`);
      if (!res.ok) {
        alert("Clinic not found. Please check the clinic code.");
        setCallState("idle");
        return;
      }
    } catch {
      alert("Backend not running. Please start the server.");
      setCallState("idle");
      return;
    }

    // Resolve clinic ID — try auth first, fall back to slug
    let clinicId = clinicSlug;
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
      if (token) {
        const meRes = await fetch(`${API_BASE}/api/clinics/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (meRes.ok) {
          const meData = await meRes.json();
          clinicId = meData.id;
        }
      }
    } catch {
      // Non-critical — slug fallback is fine
    }

    // Connect WebSocket
    const wsUrl = `${WS_BASE}/api/voice-call/ws/${clinicId}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setCallState("calling");
      setAiState("speaking"); // AI speaks greeting first
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);

        if (msg.type === "response") {
          setTranscript((prev) => [...prev, { role: "ai", text: msg.text }]);
          setAiState("speaking");
        } else if (msg.type === "transcript") {
          setTranscript((prev) => [...prev, { role: "user", text: msg.text }]);
        } else if (msg.type === "state") {
          setAiState(msg.state);
        } else if (msg.type === "audio") {
          playAudio(msg.data, msg.format);
        }
      } catch (e) {
        console.error("Failed to parse WS message:", e);
      }
    };

    ws.onclose = () => {
      setCallState("ended");
      stopRecording();
    };

    ws.onerror = () => {
      setCallState("ended");
    };
  }, [clinicSlug]);

  const playAudio = async (base64Audio: string, format: string) => {
    try {
      setAiState("speaking");
      const audioBytes = Uint8Array.from(atob(base64Audio), (c) => c.charCodeAt(0));
      const blob = new Blob([audioBytes], { type: `audio/${format || "mp3"}` });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => {
        setAiState("listening");
        URL.revokeObjectURL(url);
      };
      await audio.play();
    } catch (e) {
      console.error("Audio playback failed:", e);
      setAiState("listening");
    }
  };

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm",
      });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const arrayBuffer = await audioBlob.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

        // Send to WebSocket
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(
            JSON.stringify({
              type: "audio",
              data: base64,
              format: "webm",
            })
          );
          setAiState("processing");
        }

        // Stop all tracks
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (e) {
      console.error("Mic access failed:", e);
      alert("Please allow microphone access to use voice calling.");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  }, []);

  const sendTextMessage = useCallback((text: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN && text.trim()) {
      wsRef.current.send(JSON.stringify({ type: "text", data: text }));
      setTranscript((prev) => [...prev, { role: "user", text: text.trim() }]);
      setAiState("processing");
    }
  }, []);

  const endCall = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    stopRecording();
    setCallState("ended");
  }, [stopRecording]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950 flex flex-col">
      {/* Header */}
      <header className="p-4 text-center border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur">
        <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">
          CliniqAI Voice Assistant
        </h1>
        <p className="text-sm text-gray-500">Talk to our AI receptionist</p>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 max-w-2xl mx-auto w-full">
        {/* IDLE STATE */}
        {callState === "idle" && (
          <div className="text-center space-y-6 w-full max-w-md">
            <div className="w-24 h-24 mx-auto rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Phone className="w-12 h-12 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-2">Call AI Receptionist</h2>
              <p className="text-gray-500">
                Click the button below to start a voice conversation. You can ask about doctors,
                book appointments, check queue status, and more.
              </p>
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Clinic Code
              </label>
              <input
                type="text"
                value={clinicSlug}
                onChange={(e) => setClinicSlug(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg text-center text-lg dark:bg-gray-800 dark:border-gray-700"
                placeholder="e.g., city-dental-bangalore"
              />
            </div>
            <button
              onClick={startCall}
              className="w-full py-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl text-lg font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Phone className="w-5 h-5" />
              Start Call
            </button>
          </div>
        )}

        {/* CONNECTING STATE */}
        {callState === "connecting" && (
          <div className="text-center space-y-4">
            <div className="w-24 h-24 mx-auto rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center animate-pulse">
              <Phone className="w-12 h-12 text-yellow-600" />
            </div>
            <p className="text-lg">Connecting...</p>
          </div>
        )}

        {/* CALLING STATE */}
        {callState === "calling" && (
          <div className="w-full space-y-4 flex flex-col h-full">
            {/* Status Bar */}
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-green-700 dark:text-green-400">
                  {aiState === "listening"
                    ? "Listening..."
                    : aiState === "processing"
                      ? "Thinking..."
                      : "Speaking..."}
                </span>
              </div>
              <button
                onClick={endCall}
                className="px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full text-sm flex items-center gap-1.5 transition-colors"
              >
                <PhoneOff className="w-4 h-4" />
                End Call
              </button>
            </div>

            {/* Transcript */}
            <div className="flex-1 overflow-y-auto space-y-3 min-h-[300px] max-h-[400px] p-2">
              {transcript.length === 0 && (
                <div className="text-center text-gray-400 text-sm pt-8">
                  Waiting for the conversation to begin...
                </div>
              )}
              {transcript.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                      msg.role === "user"
                        ? "bg-blue-500 text-white rounded-br-sm"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={transcriptEndRef} />
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-2xl border shadow-lg">
              {/* Mic Button */}
              <button
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                onTouchStart={startRecording}
                onTouchEnd={stopRecording}
                className={`p-4 rounded-full transition-all ${
                  isRecording
                    ? "bg-red-500 text-white scale-110 shadow-lg shadow-red-200"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
                disabled={aiState === "speaking"}
              >
                {isRecording ? (
                  <Mic className="w-6 h-6 animate-pulse" />
                ) : (
                  <Mic className="w-6 h-6" />
                )}
              </button>
              <span className="text-xs text-gray-400">
                {isRecording ? "Recording... Release to send" : "Hold to speak"}
              </span>

              {/* Text input fallback */}
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && textInput.trim()) {
                      sendTextMessage(textInput);
                      setTextInput("");
                    }
                  }}
                  placeholder="Or type here..."
                  className="flex-1 px-3 py-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
                <button
                  onClick={() => {
                    sendTextMessage(textInput);
                    setTextInput("");
                  }}
                  disabled={!textInput.trim()}
                  className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ENDED STATE */}
        {callState === "ended" && (
          <div className="text-center space-y-6 w-full max-w-md">
            <div className="w-24 h-24 mx-auto rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <PhoneOff className="w-12 h-12 text-gray-400" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-2">Call Ended</h2>
              <p className="text-gray-500">Thank you for calling CliniqAI.</p>
            </div>

            {/* Show transcript summary */}
            {transcript.length > 0 && (
              <div className="text-left bg-gray-50 dark:bg-gray-800 rounded-lg p-4 max-h-[300px] overflow-y-auto space-y-2">
                <h3 className="font-medium text-sm text-gray-500 mb-2">Call Transcript</h3>
                {transcript.map((msg, i) => (
                  <div key={i} className="text-sm">
                    <span
                      className={`font-medium ${msg.role === "user" ? "text-blue-600" : "text-green-600"}`}
                    >
                      {msg.role === "user" ? "You: " : "AI: "}
                    </span>
                    {msg.text}
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => {
                setCallState("idle");
                setTranscript([]);
              }}
              className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors"
            >
              Call Again
            </button>
          </div>
        )}
      </main>

      <footer className="p-4 text-center text-xs text-gray-400 border-t">
        Powered by CliniqAI | Sarvam AI Voice | Free, no phone number needed
      </footer>
    </div>
  );
}
