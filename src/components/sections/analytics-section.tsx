"use client";

import { AnalyticsChart } from "@/src/components/ui/analytics-chart";
import { Card, CardHeader } from "@/src/components/ui/card";
import { dashboardStats, analytics } from "@/src/mock-data/analytics";
import { EmptyState } from "@/src/components/ui/empty-state";

interface AnalyticsSectionProps {
  /** Whether the viewer may see company-wide analytics (computed by the page via permissions). */
  canViewCompanyAnalytics: boolean;
}

/** Pure presentational analytics section. Permission comes from the page. */
export function AnalyticsSection({ canViewCompanyAnalytics }: AnalyticsSectionProps) {
  if (!canViewCompanyAnalytics) {
    return <EmptyState title="Access restricted" message="Only administrators have access to company-wide operating analytics." />;
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1.4fr_0.8fr]">
      <Card>
        <CardHeader title="Company Performance" />
        <div className="p-5">
          <AnalyticsChart data={analytics} />
        </div>
      </Card>
      <Card>
        <CardHeader title="Operating Signals" />
        <div className="space-y-4 p-5">
          {dashboardStats.map((stat) => (
            <div key={stat.label} className="surface-card-inner p-4">
              <p className="text-xs leading-5 text-slate-500">{stat.label}</p>
              <p className="mt-1 text-2xl font-semibold leading-8 text-slate-950">{stat.value}</p>
              <p className="text-sm leading-6 text-slate-600">{stat.change}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
