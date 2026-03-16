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

const accentBarMap: Record<StatColor, string> = {
  primary: "accent-bar-primary",
  accent: "accent-bar-accent",
  emerald: "accent-bar-emerald",
  amber: "accent-bar-amber",
  violet: "accent-bar-violet",
  rose: "accent-bar-rose",
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
      className={`card-hover overflow-hidden animate-fade-in-up ${accentBarMap[color]}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 min-w-0">
            <p className="text-[13px] font-medium text-muted-foreground tracking-wide uppercase truncate">
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
                className={`inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-2 py-0.5 ${
                  trend.positive
                    ? "text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10"
                    : "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-500/10"
                }`}
              >
                {trend.positive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span>
                  {trend.positive ? "+" : ""}
                  {trend.value}%
                </span>
              </div>
            )}
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconColorMap[color]} transition-transform duration-300 group-hover:scale-110`}
          >
            <Icon className="h-5.5 w-5.5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
