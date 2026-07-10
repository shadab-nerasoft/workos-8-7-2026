import ProjectsPageClient from "./page-client";

export const metadata = {
  title: "Projects",
  description: "Search, filter, and sort projects with progress, budgets, status, and deadlines.",
};

export default function ProjectsPage() {
  return <ProjectsPageClient />;
}
