import { AppShell } from "@/src/components/common/app-shell";
import { PageHeader } from "@/src/components/sections/page-header";
import { AnalyticsSection } from "@/src/components/sections/analytics-section";

export default function AnalyticsPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Company Analytics"
        title="Analyze performance, delivery, and capacity"
        description="High-level visibility into company-wide project completion, team productivity, and active bottlenecks."
      />
      <AnalyticsSection />
    </AppShell>
  );
}
