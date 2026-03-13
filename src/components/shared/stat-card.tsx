"use client";

import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type StatColor = "primary" | "accent" | "emerald" | "amber" | "violet" | "rose";

const iconColorMap: Record<StatColor, string> = {
  primary: "bg-primary/10 text-primary dark:bg-primary/15",
  accent: "bg-accent/10 text-accent dark:bg-accent/15",
  emerald: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
  amber: "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
  violet: "bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400",
  rose: "bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400",
};

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: { value: number; positive: boolean };
  delay?: number;
  color?: StatColor;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  delay = 0,
  color = "primary",
}: StatCardProps) {
  return (
    <Card
      className="card-hover overflow-hidden animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-[13px] font-medium text-muted-foreground tracking-wide uppercase">
              {title}
            </p>
            <p
              className="text-[28px] font-bold tracking-tight leading-none animate-counter-up"
              style={{ animationDelay: `${delay + 150}ms` }}
            >
              {value}
            </p>
            {trend && (
              <div
                className={`flex items-center gap-1.5 text-xs font-medium ${
                  trend.positive
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-500 dark:text-red-400"
                }`}
              >
                {trend.positive ? (
                  <TrendingUp className="h-3.5 w-3.5" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5" />
                )}
                <span>
                  {trend.positive ? "+" : ""}
                  {trend.value}% from last month
                </span>
              </div>
            )}
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconColorMap[color]}`}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
