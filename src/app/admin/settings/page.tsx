"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function SettingsPage() {
  const [platformName, setPlatformName] = useState("CliniqAI");
  const [supportEmail, setSupportEmail] = useState("support@cliniqai.com");
  const [timezone, setTimezone] = useState("Asia/Kolkata");

  const [twoFactor, setTwoFactor] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [passwordPolicy, setPasswordPolicy] = useState("strong");

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Configure platform settings and preferences
        </p>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="mb-6">
          <TabsTrigger value="general" className="cursor-pointer">General</TabsTrigger>
          <TabsTrigger value="security" className="cursor-pointer">Security</TabsTrigger>
          <TabsTrigger value="notifications" className="cursor-pointer">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Manage platform-wide configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="platform-name">Platform Name</Label>
                  <Input
                    id="platform-name"
                    value={platformName}
                    onChange={(e) => setPlatformName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="support-email">Support Email</Label>
                  <Input
                    id="support-email"
                    type="email"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2 max-w-sm">
                <Label htmlFor="timezone">Default Timezone</Label>
                <Select value={timezone} onValueChange={(v) => v && setTimezone(v)}>
                  <SelectTrigger className="w-full cursor-pointer">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Kolkata" className="cursor-pointer">
                      Asia/Kolkata (IST)
                    </SelectItem>
                    <SelectItem value="America/New_York" className="cursor-pointer">
                      America/New_York (EST)
                    </SelectItem>
                    <SelectItem value="Europe/London" className="cursor-pointer">
                      Europe/London (GMT)
                    </SelectItem>
                    <SelectItem value="Asia/Dubai" className="cursor-pointer">
                      Asia/Dubai (GST)
                    </SelectItem>
                    <SelectItem value="Asia/Singapore" className="cursor-pointer">
                      Asia/Singapore (SGT)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className="flex justify-end">
                <Button className="cursor-pointer">
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Configure authentication and access policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Require 2FA for all admin accounts
                  </p>
                </div>
                <Switch
                  checked={twoFactor}
                  onCheckedChange={setTwoFactor}
                />
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                  <Input
                    id="session-timeout"
                    type="number"
                    value={sessionTimeout}
                    onChange={(e) => setSessionTimeout(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-policy">Password Policy</Label>
                  <Select value={passwordPolicy} onValueChange={(v) => v && setPasswordPolicy(v)}>
                    <SelectTrigger className="w-full cursor-pointer">
                      <SelectValue placeholder="Select policy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic" className="cursor-pointer">
                        Basic (8+ characters)
                      </SelectItem>
                      <SelectItem value="strong" className="cursor-pointer">
                        Strong (8+ chars, mixed case, numbers)
                      </SelectItem>
                      <SelectItem value="strict" className="cursor-pointer">
                        Strict (12+ chars, mixed case, numbers, symbols)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />
              <div className="flex justify-end">
                <Button className="cursor-pointer">
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure how and when notifications are sent
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Send system alerts and reports via email
                  </p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Send critical alerts via SMS to admin phone
                  </p>
                </div>
                <Switch
                  checked={smsNotifications}
                  onCheckedChange={setSmsNotifications}
                />
              </div>

              <Separator />
              <div className="flex justify-end">
                <Button className="cursor-pointer">
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
