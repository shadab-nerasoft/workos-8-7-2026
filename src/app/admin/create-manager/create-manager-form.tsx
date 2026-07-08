// src/app/admin/create-manager/create-manager-form.tsx
'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { createManager, NewManager } from '@/src/services/manager.service';
import { useRouter } from 'next/navigation';
import { Card, CardHeader } from '@/src/components/ui/card';
import { FormField, Input } from '@/src/components/ui/form-field';
import { Button } from '@/src/components/ui/button';

interface FormValues {
  name: string;
  department: string;
  teamAccess: string; // comma‑separated list
}

export function CreateManagerForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();
  const router = useRouter();

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    const manager: NewManager = {
      name: data.name,
      department: data.department,
      teamAccess: data.teamAccess.split(',').map((t) => t.trim()),
    };
    createManager(manager);
    router.push('/admin');
  };

  return (
    <div className="max-w-xl mx-auto mt-8">
      <Card>
        <CardHeader title="Manager Details" />
        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              id="name"
              label="Name"
              required
              error={errors.name ? 'Name is required' : undefined}
            >
              <Input
                id="name"
                placeholder="Enter full name"
                hasError={!!errors.name}
                {...register('name', { required: true })}
              />
            </FormField>

            <FormField
              id="department"
              label="Department"
              required
              error={errors.department ? 'Department is required' : undefined}
            >
              <Input
                id="department"
                placeholder="e.g. Engineering"
                hasError={!!errors.department}
                {...register('department', { required: true })}
              />
            </FormField>

            <FormField
              id="teamAccess"
              label="Team Access"
              description="Comma-separated list of team names"
              required
              error={errors.teamAccess ? 'At least one team is required' : undefined}
            >
              <Input
                id="teamAccess"
                placeholder="e.g. TeamA, TeamB"
                hasError={!!errors.teamAccess}
                {...register('teamAccess', { required: true })}
              />
            </FormField>

            <div className="pt-2 flex justify-end">
              <Button type="submit" variant="primary" size="md">
                Create Manager
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
