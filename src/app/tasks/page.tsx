import TasksPageClient from "./page-client";

export const metadata = {
  title: "Tasks",
  description: "Role-aware task management: list and kanban views, filters, and stats",
};

export default function TasksPage() {
  return <TasksPageClient />;
}
