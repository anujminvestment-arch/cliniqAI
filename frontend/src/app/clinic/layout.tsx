"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  ListOrdered,
  UserRound,
  Stethoscope,
  Receipt,
  Mic,
  MapPin,
  Search,
  Bell,
  LogOut,
  User,
  Settings,
  Activity,
  Pill,
  MessageSquare,
  CalendarCheck,
  UserCheck,
  BarChart3,
  CreditCard,
  ClipboardList,
  TrendingUp,
  Video,
  Star,
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

const navGroups = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", href: "/clinic", icon: LayoutDashboard },
    ],
  },
  {
    label: "Appointments & Queue",
    items: [
      { title: "Appointments", href: "/clinic/appointments", icon: CalendarDays },
      { title: "Queue", href: "/clinic/queue", icon: ListOrdered },
      { title: "Conversations", href: "/clinic/conversations", icon: MessageSquare },
    ],
  },
  {
    label: "Patient Care",
    items: [
      { title: "Patients", href: "/clinic/patients", icon: UserRound },
      { title: "Doctors", href: "/clinic/doctors", icon: UserCheck },
      { title: "Staff", href: "/clinic/staff", icon: Stethoscope },
      { title: "Prescriptions", href: "/clinic/prescriptions", icon: Pill },
      { title: "Consultations", href: "/clinic/consultations", icon: MessageSquare },
      { title: "Follow-ups", href: "/clinic/follow-ups", icon: CalendarCheck },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "Billing", href: "/clinic/billing", icon: Receipt },
      { title: "Payments", href: "/clinic/payments", icon: CreditCard },
      { title: "Waitlist", href: "/clinic/waitlist", icon: ClipboardList },
      { title: "Reports", href: "/clinic/reports", icon: BarChart3 },
      { title: "Analytics", href: "/clinic/analytics", icon: TrendingUp },
      { title: "Feedback & NPS", href: "/clinic/feedback", icon: Star },
      { title: "Notifications", href: "/clinic/notifications", icon: Bell },
    ],
  },
  {
    label: "Settings",
    items: [
      { title: "AI Voice Settings", href: "/clinic/ai-settings", icon: Mic },
      { title: "Telemedicine", href: "/clinic/telemedicine", icon: Video },
      { title: "Branches", href: "/clinic/branches", icon: MapPin },
    ],
  },
];

export default function ClinicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, membership, logout: doLogout } = useAuth();
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

  const userName = user?.name || "User";
  const userEmail = user?.email || "";
  const userInitials = userName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const clinicName = membership?.clinic_name || "CliniqAI";
  const roleName = membership?.role === "clinic_owner" ? "Clinic Admin" : (membership?.role || "Staff");

  function isActive(href: string): boolean {
    if (href === "/clinic") return pathname === "/clinic";
    return pathname.startsWith(href);
  }

  return (
    <SidebarProvider>
      <Sidebar variant="sidebar" collapsible="icon">
        <SidebarHeader className="p-3">
          <Link href="/clinic" className="flex items-center gap-2.5 cursor-pointer rounded-xl gradient-clinic p-3 shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/25">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/20 backdrop-blur font-bold text-sm text-white">
              <Activity className="h-4.5 w-4.5" />
            </div>
            <div className="flex flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden">
              <span className="font-bold text-sm text-white tracking-tight">{clinicName}</span>
              <span className="text-[10px] font-medium text-white/70">{roleName}</span>
            </div>
          </Link>
        </SidebarHeader>

        <SidebarSeparator />

        <SidebarContent>
          {navGroups.map((group) => (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <SidebarMenu>
                {group.items.map((item) => (
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
          ))}
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
          <div className="relative flex-1 max-w-sm" role="search" aria-label="Search patients and appointments">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search patients, appointments..." className="pl-8" />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button className="relative cursor-pointer rounded-lg p-2 hover:bg-muted transition-colors" aria-label={`Notifications${notifCount > 0 ? `, ${notifCount} unread` : ""}`}>
              <Bell className="h-5 w-5 text-muted-foreground" />
              {notifCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
                  {notifCount}
                </span>
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
