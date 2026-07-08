import { AppShell } from "@/src/components/common/app-shell";
import { DashboardSkeleton } from "@/src/components/ui/skeleton";

export default function Loading() {
  return (
    <AppShell>
      <DashboardSkeleton />
    </AppShell>
  );
}
