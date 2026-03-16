"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { auth as authApi } from "@/lib/api";

interface UserData {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

interface Membership {
  clinic_id: string;
  role: string;
  clinic_name?: string;
  clinic_slug?: string;
}

interface AuthState {
  user: UserData | null;
  membership: Membership | null;
  memberships: Membership[];
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ role: string }>;
  register: (data: { name: string; email: string; password: string; phone?: string; clinic_name?: string; clinic_slug?: string }) => Promise<{ role: string }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    membership: null,
    memberships: [],
    isLoading: true,
    isAuthenticated: false,
  });

  const refresh = useCallback(async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setState({ user: null, membership: null, memberships: [], isLoading: false, isAuthenticated: false });
        return;
      }
      const data: any = await authApi.me();
      setState({
        user: data.user,
        membership: data.memberships?.[0] || { clinic_id: data.current_clinic_id, role: data.current_role },
        memberships: data.memberships || [],
        isLoading: false,
        isAuthenticated: true,
      });
      // Connect socket
      const { getSocket: initSocket } = await import("@/lib/socket");
      initSocket();
    } catch {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      setState({ user: null, membership: null, memberships: [], isLoading: false, isAuthenticated: false });
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = async (email: string, password: string) => {
    const data = await authApi.login(email, password);
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("refresh_token", data.refresh_token);
    setState({
      user: data.user,
      membership: data.membership,
      memberships: [data.membership],
      isLoading: false,
      isAuthenticated: true,
    });
    // Connect socket with new token
    const { getSocket } = await import("@/lib/socket");
    getSocket();
    return { role: data.membership.role };
  };

  const register = async (regData: { name: string; email: string; password: string; phone?: string; clinic_name?: string; clinic_slug?: string }) => {
    const data: any = await authApi.register(regData);
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("refresh_token", data.refresh_token);
    setState({
      user: data.user,
      membership: data.membership,
      memberships: [data.membership],
      isLoading: false,
      isAuthenticated: true,
    });
    return { role: data.membership.role };
  };

  const logout = async () => {
    try { await authApi.logout(); } catch {}
    const { disconnectSocket } = await import("@/lib/socket");
    disconnectSocket();
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setState({ user: null, membership: null, memberships: [], isLoading: false, isAuthenticated: false });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
