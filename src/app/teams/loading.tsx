import { AppShell } from "@/src/components/common/app-shell";
import { Skeleton } from "@/src/components/ui/skeleton";

export default function Loading() {
  return (
    <AppShell>
      <Skeleton className="h-12 w-80" />
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    </AppShell>
  );
}
