import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <div className="skeleton h-8 w-48" />
        <div className="skeleton h-4 w-72" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-5 space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="skeleton h-3 w-24" />
                <div className="skeleton h-8 w-32" />
                <div className="skeleton h-3 w-36" />
              </div>
              <Skeleton className="h-11 w-11 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-6">
          <div className="skeleton h-5 w-32 mb-4" />
          <Skeleton className="h-[300px] w-full rounded-lg" />
        </div>
        <div className="rounded-xl border bg-card p-6">
          <div className="skeleton h-5 w-32 mb-4" />
          <Skeleton className="h-[300px] w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
