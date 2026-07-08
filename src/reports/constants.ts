import type { Priority, TaskStatus } from "../types";

export interface WorkspaceTask {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: Priority;
  status: TaskStatus;
  expectedCompletionDate: string;
}

export const mockWorkspaceTasks: WorkspaceTask[] = [
  {
    id: "wt-1",
    title: "Build project table filters",
    description: "Add search, status filters, and sortable columns for active projects.",
    category: "Development",
    priority: "high",
    status: "in-progress",
    expectedCompletionDate: "2026-06-28",
  },
  {
    id: "wt-2",
    title: "Map admin dashboard KPIs",
    description: "Define company-level signals for project health and resource allocation.",
    category: "Development",
    priority: "high",
    status: "completed",
    expectedCompletionDate: "2026-06-20",
  },
  {
    id: "wt-3",
    title: "Implement stats card animations",
    description: "Add count-up animations and skeleton loading states to KPI stat cards.",
    category: "Development",
    priority: "medium",
    status: "in-progress",
    expectedCompletionDate: "2026-06-25",
  },
  {
    id: "wt-4",
    title: "Create color token documentation",
    description: "Document all color-mix based tokens with usage examples and contrast ratios.",
    category: "Design",
    priority: "medium",
    status: "in-progress",
    expectedCompletionDate: "2026-07-05",
  },
  {
    id: "wt-5",
    title: "Accessible focus indicators",
    description: "Add visible focus rings to all interactive components meeting WCAG 2.1 AA.",
    category: "Other",
    priority: "low",
    status: "todo",
    expectedCompletionDate: "2026-07-15",
  }
];
