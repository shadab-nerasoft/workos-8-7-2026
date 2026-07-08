import { AppShell } from "@/src/components/common/app-shell";
import { Skeleton } from "@/src/components/ui/skeleton";

export default function Loading() {
  return (
    <AppShell>
      <Skeleton className="h-12 w-80" />
      <Skeleton className="mt-6 h-80" />
    </AppShell>
  );
}
