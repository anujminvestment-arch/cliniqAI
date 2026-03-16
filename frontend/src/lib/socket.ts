"use client";

import { io, Socket } from "socket.io-client";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    socket = io(API_BASE, {
      auth: token ? { token } : undefined,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });

    socket.on("connect", () => {
      console.log("[Socket.IO] Connected:", socket?.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("[Socket.IO] Disconnected:", reason);
    });

    socket.on("connect_error", (err) => {
      console.log("[Socket.IO] Connection error:", err.message);
    });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function joinTVRoom(clinicSlug: string) {
  const s = getSocket();
  s.emit("join_tv", { clinic_slug: clinicSlug });
}
