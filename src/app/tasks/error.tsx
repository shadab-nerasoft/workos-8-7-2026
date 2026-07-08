"use client";

import { AppShell } from "@/src/components/common/app-shell";
import { RouteErrorPanel } from "@/src/components/common/route-error-panel";

export default function Error(props: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  return (
    <AppShell>
      <RouteErrorPanel {...props} />
    </AppShell>
  );
}
