import { Skeleton } from "@/components/ui/skeleton";

export default function PatientLoading() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <div className="skeleton h-8 w-56" />
        <div className="skeleton h-4 w-40" />
      </div>
      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-center gap-4">
          <Skeleton className="h-14 w-14 rounded-full" />
          <div className="space-y-2 flex-1">
            <div className="skeleton h-4 w-40" />
            <div className="skeleton h-3 w-56" />
          </div>
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="skeleton h-6 w-44" />
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-card p-5 space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1.5 flex-1">
                  <div className="skeleton h-4 w-32" />
                  <div className="skeleton h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-px w-full" />
              <div className="flex gap-4">
                <div className="skeleton h-3 w-20" />
                <div className="skeleton h-3 w-16" />
                <div className="skeleton h-3 w-28" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-5 flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div className="space-y-1.5">
              <div className="skeleton h-4 w-28" />
              <div className="skeleton h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
