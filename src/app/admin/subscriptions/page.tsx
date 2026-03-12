"use client";

import { Check } from "lucide-react";
import {
  Bar,
  BarChart,
  Pie,
  PieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { subscriptionPlans } from "@/lib/mock-data";

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const planDistribution = subscriptionPlans.map((plan) => ({
  name: plan.name,
  value: plan.clinics,
}));

const revenueByPlan = subscriptionPlans.map((plan) => ({
  name: plan.name,
  revenue: plan.price * plan.clinics,
}));

const PIE_COLORS = ["#0891B2", "#059669", "#7C3AED"];

const planHighlight: Record<string, boolean> = {
  Basic: false,
  Professional: true,
  Enterprise: false,
};

const planBadge: Record<string, string> = {
  Professional: "Most Popular",
};

export default function SubscriptionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Subscriptions</h1>
        <p className="text-muted-foreground">
          Manage subscription plans and view subscriber analytics
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {subscriptionPlans.map((plan, index) => (
          <Card
            key={plan.name}
            className={
              planHighlight[plan.name]
                ? "border-primary shadow-md relative"
                : "relative"
            }
          >
            {planBadge[plan.name] && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">
                  {planBadge[plan.name]}
                </Badge>
              </div>
            )}
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-lg">{plan.name}</CardTitle>
              <div className="mt-2">
                <span className="text-3xl font-bold">{formatCurrency(plan.price)}</span>
                <span className="text-muted-foreground text-sm">/month</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {plan.clinics} active clinics
              </p>
            </CardHeader>
            <CardContent>
              <Separator className="mb-4" />
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                variant={planHighlight[plan.name] ? "default" : "outline"}
                className="w-full mt-6 cursor-pointer"
              >
                {planHighlight[plan.name] ? "Current Default" : "View Details"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Plan Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={planDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {planDistribution.map((_, i) => (
                      <Cell key={`cell-${i}`} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      color: "var(--popover-foreground)",
                    }}
                    formatter={(value: number) => [`${value} clinics`, "Subscribers"]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Revenue by Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueByPlan}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="name"
                    className="text-xs"
                    tick={{ fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    className="text-xs"
                    tick={{ fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${(v / 100000).toFixed(1)}L`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      color: "var(--popover-foreground)",
                    }}
                    formatter={(value: number) => [formatCurrency(value), "Revenue"]}
                  />
                  <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                    {revenueByPlan.map((_, i) => (
                      <Cell key={`bar-${i}`} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
