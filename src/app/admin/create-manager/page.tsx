// src/app/admin/create-manager/page.tsx
import { AppShell } from '@/src/components/common/app-shell';
import { PageHeader } from '@/src/components/sections/page-header';
import { CreateManagerForm } from './create-manager-form';

export const metadata = {
  title: 'Create Manager',
  description: 'Admin form to create a new manager',
};

export default function CreateManagerPage() {
  const headerInfo = {
    eyebrow: 'Admin Dashboard',
    title: 'Create Manager',
    description: 'Add a new manager to the organization',
  };

  return (
    <AppShell>
      <PageHeader {...headerInfo} />
      <CreateManagerForm />
    </AppShell>
  );
}

