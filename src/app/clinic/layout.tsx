"use client";

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
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/shared/theme-toggle";

const navItems = [
  { title: "Dashboard", href: "/clinic", icon: LayoutDashboard },
  { title: "Appointments", href: "/clinic/appointments", icon: CalendarDays },
  { title: "Queue", href: "/clinic/queue", icon: ListOrdered },
  { title: "Patients", href: "/clinic/patients", icon: UserRound },
  { title: "Doctors & Staff", href: "/clinic/staff", icon: Stethoscope },
  { title: "Billing", href: "/clinic/billing", icon: Receipt },
  { title: "AI Voice Settings", href: "/clinic/ai-settings", icon: Mic },
  { title: "Branches", href: "/clinic/branches", icon: MapPin },
];

export default function ClinicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  function isActive(href: string): boolean {
    if (href === "/clinic") return pathname === "/clinic";
    return pathname.startsWith(href);
  }

  return (
    <SidebarProvider>
      <Sidebar variant="sidebar" collapsible="icon">
        <SidebarHeader className="p-3">
          <Link href="/clinic" className="flex items-center gap-2.5 cursor-pointer rounded-xl sidebar-gradient-header p-3 shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/25">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/20 backdrop-blur font-bold text-sm text-white">
              S
            </div>
            <div className="flex flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden">
              <span className="font-bold text-sm text-white tracking-tight">SmileCare Dental</span>
              <span className="text-[10px] font-medium text-white/70">Clinic Admin</span>
            </div>
          </Link>
        </SidebarHeader>

        <SidebarSeparator />

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Management</SidebarGroupLabel>
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
                    <AvatarFallback>PS</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden">
                    <span className="text-sm font-medium">Dr. Priya Sharma</span>
                    <span className="text-xs text-muted-foreground">priya@smilecare.com</span>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align="start" sideOffset={8}>
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
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b glass px-6">
          <SidebarTrigger className="cursor-pointer" />
          <Separator orientation="vertical" className="h-6" />
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search patients, appointments..." className="pl-8" />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button className="relative cursor-pointer rounded-lg p-2 hover:bg-muted transition-colors">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
                3
              </span>
            </button>
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger className="cursor-pointer">
                <Avatar>
                  <AvatarFallback>PS</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={8}>
                <DropdownMenuLabel>Dr. Priya Sharma</DropdownMenuLabel>
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
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <div className="flex-1 p-6 gradient-mesh min-h-screen">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
