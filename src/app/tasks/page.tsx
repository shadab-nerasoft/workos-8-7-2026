import { AppShell } from "@/src/components/common/app-shell";
import { PageHeader } from "@/src/components/sections/page-header";
import { TasksSection } from "@/src/components/sections/tasks-section";

export default function TasksPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Task management"
        title="Execute work and move tickets across the board"
        description="A role-aware kanban board to manage status, priority, and task ownership."
      />
      <TasksSection />
    </AppShell>
  );
}
