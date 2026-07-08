// src/app/admin/page.tsx
import { AppShell } from '@/src/components/common/app-shell';
import { PageHeader } from '@/src/components/sections/page-header';
import { DashboardSection } from '@/src/components/sections/dashboard-section';
import Link from 'next/link';

export const metadata = {
  title: 'Admin Dashboard',
  description: 'Admin overview of company health and performance',
};

export default function AdminPage() {
  const headerInfo = {
    eyebrow: 'Admin Dashboard',
    title: 'Company Health & Performance',
    description:
      'High‑level visibility into company‑wide project completion, team productivity, and active bottlenecks.',
  };

  return (
    <AppShell>
      <PageHeader {...headerInfo} />
      <DashboardSection />
      <section className="mt-8">
        <Link
          href="/admin/create-manager"
          className="inline-block rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-500"
        >
          Create Manager
        </Link>
      </section>
    </AppShell>
  );
}
