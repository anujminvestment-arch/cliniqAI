"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarPlus,
  CalendarDays,
  Clock,
  FileText,
  Pill,
  CreditCard,
  Bell,
  LogOut,
  User,
  Settings,
  Activity,
  Heart,
  Search,
  UserRound,
  Video,
  Users,
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
import { Button } from "@/components/ui/button";
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

const navItems = [
  { title: "Dashboard", href: "/patient", icon: LayoutDashboard },
  { title: "Book Appointment", href: "/patient/book", icon: CalendarPlus },
  { title: "My Appointments", href: "/patient/appointments", icon: CalendarDays },
  { title: "Video Consult", href: "/patient/telemedicine", icon: Video },
  { title: "Queue Status", href: "/patient/queue", icon: Clock },
  { title: "Health Overview", href: "/patient/health", icon: Heart },
  { title: "Family", href: "/patient/family", icon: Users },
  { title: "Medical Records", href: "/patient/records", icon: FileText },
  { title: "Prescriptions", href: "/patient/prescriptions", icon: Pill },
  { title: "Billing", href: "/patient/billing", icon: CreditCard },
  { title: "Feedback", href: "/patient/feedback", icon: Star },
  { title: "My Profile", href: "/patient/profile", icon: UserRound },
];

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  function isActive(href: string): boolean {
    if (href === "/patient") return pathname === "/patient";
    return pathname.startsWith(href);
  }

  return (
    <SidebarProvider>
      <Sidebar variant="sidebar" collapsible="icon">
        <SidebarHeader className="p-3">
          <Link href="/patient" className="flex items-center gap-2.5 cursor-pointer rounded-xl gradient-patient p-3 shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/25">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/20 backdrop-blur font-bold text-sm text-white">
              <Activity className="h-4 w-4" />
            </div>
            <div className="flex flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden">
              <span className="font-bold text-sm text-white tracking-tight">CliniqAI</span>
              <span className="text-[10px] font-medium text-white/70">Patient Portal</span>
            </div>
          </Link>
        </SidebarHeader>

        <SidebarSeparator />

        <SidebarContent>
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
                    <AvatarFallback>VS</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden">
                    <span className="text-sm font-medium">Vikram Singh</span>
                    <span className="text-xs text-muted-foreground">vikram@patient.com</span>
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
                    <DropdownMenuItem className="cursor-pointer">
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
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search appointments, records..." className="pl-8" aria-label="Search" />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative cursor-pointer" aria-label="Notifications, 2 unread">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                2
              </span>
            </Button>
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger className="cursor-pointer">
                <Avatar>
                  <AvatarFallback>VS</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={8}>
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Vikram Singh</DropdownMenuLabel>
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
                  <DropdownMenuItem className="cursor-pointer">
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
