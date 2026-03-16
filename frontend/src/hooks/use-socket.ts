"use client";

import { useEffect, useRef, useCallback } from "react";
import { getSocket, disconnectSocket } from "@/lib/socket";
import type { Socket } from "socket.io-client";

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = getSocket();
    return () => {
      // Don't disconnect on unmount — keep connection alive across pages
    };
  }, []);

  const on = useCallback((event: string, handler: (...args: any[]) => void) => {
    const s = socketRef.current || getSocket();
    s.on(event, handler);
    return () => { s.off(event, handler); };
  }, []);

  return { socket: socketRef.current, on };
}

export function useSocketEvent(event: string, handler: (...args: any[]) => void) {
  const { on } = useSocket();

  useEffect(() => {
    const cleanup = on(event, handler);
    return cleanup;
  }, [event, handler, on]);
}
