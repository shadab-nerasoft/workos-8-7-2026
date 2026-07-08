// src/app/manager/page.tsx
import { AppShell } from '@/src/components/common/app-shell';
import { PageHeader } from '@/src/components/sections/page-header';
import { DashboardSection } from '@/src/components/sections/dashboard-section';

export const metadata = {
  title: 'Manager Dashboard',
  description: 'Manager view of team performance and reports',
};

export default function ManagerPage() {
  const headerInfo = {
    eyebrow: 'Manager Dashboard',
    title: 'Managing Your Team',
    description:
      "Track your team's daily reports, task progress, and overall performance metrics.",
  };

  return (
    <AppShell>
      <PageHeader {...headerInfo} />
      <DashboardSection />
    </AppShell>
  );
}
