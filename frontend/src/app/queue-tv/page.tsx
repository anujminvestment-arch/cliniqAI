"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function TVQueueContent() {
  const searchParams = useSearchParams();
  const clinicSlug = searchParams.get("clinic") || "";
  const [data, setData] = useState<any>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [secondsAgo, setSecondsAgo] = useState(0);

  const fetchQueue = useCallback(async () => {
    if (!clinicSlug) return;
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${API_BASE}/api/queue/tv/${clinicSlug}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setLastUpdated(new Date());
        setSecondsAgo(0);
      }
    } catch {}
  }, [clinicSlug]);

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 10000);
    return () => clearInterval(interval);
  }, [fetchQueue]);

  // Socket.IO for instant updates
  useEffect(() => {
    if (!clinicSlug) return;
    let cleanup: (() => void) | undefined;
    import("@/lib/socket").then(({ getSocket }) => {
      const s = getSocket();
      s.emit("join_tv", { clinic_slug: clinicSlug });
      const handler = () => { fetchQueue(); };
      s.on("queue:updated", handler);
      cleanup = () => { s.off("queue:updated", handler); };
    });
    return () => { cleanup?.(); };
  }, [clinicSlug, fetchQueue]);

  useEffect(() => {
    const tick = setInterval(() => {
      setSecondsAgo(Math.floor((Date.now() - lastUpdated.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(tick);
  }, [lastUpdated]);

  if (!clinicSlug) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">CliniqAI Queue Display</h1>
          <p className="text-xl text-gray-400">Add <code className="bg-gray-800 px-2 py-1 rounded">?clinic=your-clinic-slug</code> to the URL</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
          <p className="text-xl text-gray-400">Loading queue...</p>
        </div>
      </div>
    );
  }

  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  const dateStr = now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const doctors = data.doctors || [];

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{data.clinic_name}</h1>
          <p className="text-gray-400 text-lg">{dateStr}</p>
        </div>
        <div className="text-right">
          <p className="text-5xl font-bold font-mono tabular-nums">{timeStr}</p>
          <p className="text-sm text-gray-500 mt-1">
            Updated {secondsAgo}s ago
            <span className="inline-block h-2 w-2 rounded-full bg-green-500 ml-2 animate-pulse" />
          </p>
        </div>
      </div>

      {doctors.length === 0 ? (
        <div className="flex items-center justify-center h-[70vh]">
          <div className="text-center space-y-3">
            <p className="text-4xl font-bold text-gray-500">No Active Queue</p>
            <p className="text-xl text-gray-600">Queue will appear when patients check in</p>
          </div>
        </div>
      ) : (
        <div className={`grid gap-4 ${doctors.length === 1 ? "grid-cols-1" : doctors.length === 2 ? "grid-cols-2" : doctors.length <= 4 ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"}`}>
          {doctors.map((doc: any) => (
            <div key={doc.doctor_id} className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
              <div className="bg-gray-800/50 px-5 py-4 border-b border-gray-800">
                <h2 className="text-xl font-bold truncate">{doc.doctor_name}</h2>
                <p className="text-sm text-gray-400">{doc.specialization || "General"}</p>
                <div className="flex items-center gap-3 mt-2 text-sm">
                  <span className="text-amber-400">{doc.total_waiting} waiting</span>
                  <span className="text-gray-600">|</span>
                  <span className="text-emerald-400">{doc.completed || 0} done</span>
                </div>
              </div>

              {doc.current_patient ? (
                <div className="mx-4 mt-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="relative flex h-3 w-3">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
                    </span>
                    <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Now Consulting</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold text-emerald-400">#{doc.current_patient.token_number}</span>
                    <span className="text-lg font-medium truncate">{doc.current_patient.patient_name}</span>
                  </div>
                </div>
              ) : (
                <div className="mx-4 mt-4 rounded-xl bg-gray-800/50 border border-gray-700 p-4 text-center">
                  <p className="text-gray-500 text-sm">No patient with doctor</p>
                </div>
              )}

              <div className="p-4 space-y-2">
                {doc.queue.length === 0 ? (
                  <p className="text-center text-gray-600 text-sm py-3">No patients waiting</p>
                ) : (
                  doc.queue.slice(0, 8).map((patient: any, i: number) => (
                    <div
                      key={patient.token_number}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 ${
                        i === 0 ? "bg-amber-500/10 border border-amber-500/20" : "bg-gray-800/30"
                      }`}
                    >
                      <span className={`text-xl font-bold w-10 text-center ${i === 0 ? "text-amber-400" : "text-gray-500"}`}>
                        #{patient.token_number}
                      </span>
                      <span className={`flex-1 truncate ${i === 0 ? "text-amber-100 font-medium" : "text-gray-400"}`}>
                        {patient.patient_name}
                      </span>
                      {patient.estimated_wait && (
                        <span className="text-xs text-gray-500 whitespace-nowrap">~{patient.estimated_wait}m</span>
                      )}
                      {i === 0 && (
                        <span className="text-xs font-semibold text-amber-400 uppercase">Next</span>
                      )}
                    </div>
                  ))
                )}
                {doc.queue.length > 8 && (
                  <p className="text-center text-gray-600 text-sm">+{doc.queue.length - 8} more waiting</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-gray-950/80 backdrop-blur border-t border-gray-800 px-6 py-3 flex items-center justify-between">
        <p className="text-sm text-gray-500">Powered by CliniqAI</p>
        <p className="text-sm text-gray-500">Queue refreshes automatically</p>
      </div>
    </div>
  );
}

export default function TVQueueDisplay() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="h-12 w-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    }>
      <TVQueueContent />
    </Suspense>
  );
}
