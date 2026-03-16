import { Skeleton } from "@/components/ui/skeleton";

export default function ClinicLoading() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <div className="skeleton h-8 w-36" />
        <div className="skeleton h-4 w-64" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-5 space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="skeleton h-3 w-20" />
                <div className="skeleton h-8 w-16" />
                <div className="skeleton h-3 w-28" />
              </div>
              <Skeleton className="h-11 w-11 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 rounded-xl border bg-card p-6">
          <div className="skeleton h-5 w-40 mb-4" />
          <Skeleton className="h-[280px] w-full rounded-lg" />
        </div>
        <div className="lg:col-span-2 rounded-xl border bg-card p-6 space-y-4">
          <div className="skeleton h-5 w-32" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-1 flex-1">
                <div className="skeleton h-3 w-24" />
                <div className="skeleton h-2.5 w-36" />
              </div>
              <div className="skeleton h-5 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
