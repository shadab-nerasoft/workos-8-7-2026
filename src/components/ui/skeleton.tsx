export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-[var(--radius-sm)] bg-slate-100 ${className}`} />;
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {["one", "two", "three", "four"].map((item) => (
          <div key={item} className="surface-card p-5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-5 h-8 w-16" />
            <Skeleton className="mt-4 h-4 w-32" />
          </div>
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.4fr_0.9fr]">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
    </div>
  );
}
