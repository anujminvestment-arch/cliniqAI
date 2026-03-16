import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Spinner({ size = "md", className }: SpinnerProps) {
  const sizes = {
    sm: "h-4 w-4 border-[2px]",
    md: "h-8 w-8 border-[3px]",
    lg: "h-12 w-12 border-[3px]",
  };

  return (
    <div
      className={cn(
        "rounded-full border-muted-foreground/20 border-t-primary animate-spin",
        sizes[size],
        className
      )}
      role="status"
      aria-label="Loading"
    />
  );
}

export function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-[3px] border-muted-foreground/10 border-t-primary animate-spin" />
          <div className="absolute inset-0 h-12 w-12 rounded-full border-[3px] border-transparent border-b-accent/30 animate-spin-slow" />
        </div>
        <p className="text-sm text-muted-foreground animate-pulse-soft">Loading...</p>
      </div>
    </div>
  );
}
