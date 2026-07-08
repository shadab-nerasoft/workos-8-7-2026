// src/app/employee/page.tsx
import { AppShell } from '@/src/components/common/app-shell';
import { PageHeader } from '@/src/components/sections/page-header';
import { DashboardSection } from '@/src/components/sections/dashboard-section';

export const metadata = {
  title: 'Employee Dashboard',
  description: 'Employee view of personal tasks and reports',
};

export default function EmployeePage() {
  const headerInfo = {
    eyebrow: 'Employee Dashboard',
    title: 'Welcome back',
    description:
      "Manage your daily tasks, submit your reports, and track your performance.",
  };

  return (
    <AppShell>
      <PageHeader {...headerInfo} />
      <DashboardSection />
    </AppShell>
  );
}
