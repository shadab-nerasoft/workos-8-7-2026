import { AppShell } from "@/src/components/common/app-shell";
import { PageHeader } from "@/src/components/sections/page-header";
import { ProjectsSection } from "@/src/components/sections/projects-section";

export default function ProjectsPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Project management"
        title="Prioritize active work and delivery risk"
        description="Search, filter, and sort projects with progress, budgets, status, and deadlines visible in one table."
      />
      <ProjectsSection />
    </AppShell>
  );
}
