"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  CalendarDays,
  PhoneCall,
  AlertTriangle,
  UserPlus,
  IndianRupee,
  CheckCircle2,
  Circle,
  BellOff,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/shared/spinner";
import { notifications as notificationsApi } from "@/lib/api";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";

const typeConfig: Record<string, { icon: React.ElementType; color: string }> = {
  appointment: { icon: CalendarDays, color: "bg-primary/10 text-primary" },
  "ai-call": { icon: PhoneCall, color: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400" },
  "follow-up": { icon: AlertTriangle, color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  patient: { icon: UserPlus, color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  billing: { icon: IndianRupee, color: "bg-accent/10 text-accent" },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    notificationsApi.list()
      .then((data) => setNotifications(data.notifications))
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filtered = filter === "all"
    ? notifications
    : filter === "unread"
      ? notifications.filter((n) => !n.read)
      : notifications.filter((n) => n.type === filter);

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function toggleRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/clinic">Dashboard</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>Notifications</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight section-header">Notifications</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : "All caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" className="cursor-pointer w-fit" onClick={markAllRead}>
            <CheckCircle2 className="h-4 w-4 mr-1.5" />
            Mark all as read
          </Button>
        )}
      </div>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="all" className="cursor-pointer">
            All ({notifications.length})
          </TabsTrigger>
          <TabsTrigger value="unread" className="cursor-pointer">
            Unread ({unreadCount})
          </TabsTrigger>
          <TabsTrigger value="appointment" className="cursor-pointer">Appointments</TabsTrigger>
          <TabsTrigger value="ai-call" className="cursor-pointer">AI Calls</TabsTrigger>
          <TabsTrigger value="follow-up" className="cursor-pointer">Follow-ups</TabsTrigger>
          <TabsTrigger value="patient" className="cursor-pointer">Patients</TabsTrigger>
          <TabsTrigger value="billing" className="cursor-pointer">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-4">
          <Card>
            <CardContent className="p-0">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <BellOff className="h-12 w-12 text-muted-foreground/30 mb-3" />
                  <p className="font-medium">No notifications</p>
                  <p className="text-sm text-muted-foreground">Nothing to show in this category</p>
                </div>
              ) : (
                <div>
                  {filtered.map((notification, i) => {
                    const config = typeConfig[notification.type] || typeConfig.appointment;
                    const NIcon = config.icon;

                    return (
                      <div key={notification.id}>
                        {i > 0 && <Separator />}
                        <button
                          className={`w-full text-left px-5 py-4 flex items-start gap-4 transition-colors cursor-pointer hover:bg-muted/50 ${
                            !notification.read ? "bg-primary/[0.02] dark:bg-primary/[0.04]" : ""
                          }`}
                          onClick={() => toggleRead(notification.id)}
                        >
                          <div className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${config.color}`}>
                            <NIcon className="h-4.5 w-4.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className={`text-sm ${!notification.read ? "font-semibold" : "font-medium"}`}>
                                {notification.title}
                              </p>
                              {!notification.read && (
                                <Circle className="h-2 w-2 fill-primary text-primary shrink-0" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{notification.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
