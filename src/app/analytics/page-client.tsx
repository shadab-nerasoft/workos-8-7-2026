"use client";

import { AppShell } from "@/src/components/common/app-shell";
import { PageHeader } from "@/src/components/sections/page-header";
import { AnalyticsSection } from "@/src/components/sections/analytics-section";
import { useAuthStore } from "@/src/store";
import { can } from "@/src/lib/permissions";

/**
 * Composition root for the analytics route.
 * Owns the store read and permission check; the section is pure.
 */
export default function AnalyticsPageClient() {
  const currentUser = useAuthStore((s) => s.currentUser);

  return (
    <AppShell>
      <PageHeader
        eyebrow="Company Analytics"
        title="Analyze performance, delivery, and capacity"
        description="High-level visibility into company-wide project completion, team productivity, and active bottlenecks."
      />
      <AnalyticsSection
        canViewCompanyAnalytics={can(currentUser, "analytics:view-company")}
      />
    </AppShell>
  );
}
