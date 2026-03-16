"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  Bot,
  Settings,
  Search,
  LogOut,
  User,
  Activity,
  BarChart3,
  Shield,
  Building,
  UserPlus,
  Bell,
  ShieldCheck,
} from "lucide-react";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { useAuth } from "@/lib/auth-context";
import { notifications as notificationsApi } from "@/lib/api";

const navItems = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { title: "Organizations", href: "/admin/organizations", icon: Building },
  { title: "Onboarding", href: "/admin/onboarding", icon: UserPlus },
  { title: "Clinics", href: "/admin/clinics", icon: Building2 },
  { title: "Users", href: "/admin/users", icon: Users },
  { title: "Subscriptions", href: "/admin/subscriptions", icon: CreditCard },
  { title: "AI Analytics", href: "/admin/ai-analytics", icon: Bot },
  { title: "Reports", href: "/admin/reports", icon: BarChart3 },
  { title: "Audit Logs", href: "/admin/audit-logs", icon: Shield },
  { title: "Compliance", href: "/admin/compliance", icon: ShieldCheck },
  { title: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout: doLogout } = useAuth();
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    notificationsApi.list({ limit: 1 }).then(data => setNotifCount(data?.notifications?.length || 0)).catch(() => {});
  }, []);

  // Real-time notification updates
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    import("@/lib/socket").then(({ getSocket }) => {
      const s = getSocket();
      const handler = () => { setNotifCount(prev => prev + 1); };
      s.on("notification:new", handler);
      cleanup = () => { s.off("notification:new", handler); };
    }).catch(() => {});
    return () => { cleanup?.(); };
  }, []);

  const userName = user?.name || "Super Admin";
  const userEmail = user?.email || "";
  const userInitials = userName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  function isActive(href: string): boolean {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  return (
    <SidebarProvider>
      <Sidebar variant="sidebar" collapsible="icon">
        <SidebarHeader className="p-3">
          <Link href="/admin" className="flex items-center gap-2.5 cursor-pointer rounded-xl gradient-admin p-3 shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/25">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/20 backdrop-blur font-bold text-sm text-white">
              <Activity className="h-4 w-4" />
            </div>
            <div className="flex flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden">
              <span className="font-bold text-sm text-white tracking-tight">CliniqAI</span>
              <span className="text-[10px] font-medium text-white/70">Super Admin</span>
            </div>
          </Link>
        </SidebarHeader>

        <SidebarSeparator />

        <SidebarContent className="scrollbar-thin">
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={isActive(item.href)}
                    tooltip={item.title}
                    render={<Link href={item.href} />}
                    className="cursor-pointer"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarSeparator />
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <SidebarMenuButton
                      size="lg"
                      className="cursor-pointer"
                    />
                  }
                >
                  <Avatar size="sm">
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden">
                    <span className="text-sm font-medium">{userName}</span>
                    <span className="text-xs text-muted-foreground">{userEmail}</span>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align="start" sideOffset={8}>
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer" onClick={() => { doLogout(); window.location.href = "/login"; }}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b glass px-6">
          <SidebarTrigger className="cursor-pointer" aria-label="Toggle sidebar" />
          <Separator orientation="vertical" className="h-6" />
          <div className="relative flex-1 max-w-sm" role="search" aria-label="Search">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-8"
            />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button className="relative cursor-pointer rounded-lg p-2 hover:bg-muted transition-colors" aria-label={`Notifications${notifCount > 0 ? `, ${notifCount} unread` : ""}`}>
              <Bell className="h-5 w-5 text-muted-foreground" />
              {notifCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">{notifCount}</span>
              )}
            </button>
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger className="cursor-pointer">
                <Avatar>
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={8}>
                <DropdownMenuGroup>
                  <DropdownMenuLabel>{userName}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer" onClick={() => { doLogout(); window.location.href = "/login"; }}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <div className="flex-1 p-6 gradient-mesh min-h-screen scrollbar-thin">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
