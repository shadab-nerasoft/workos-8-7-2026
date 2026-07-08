"use client";

import { DataTable } from "@/src/components/ui/data-table";
import { ProjectStatusBadge } from "@/src/components/ui/badge";
import { formatCurrency, formatDate } from "@/src/lib/utils/format";
import type { Project } from "@/src/types";

export function ProjectsTable({ projects }: { projects: Project[] }) {
  return (
    <DataTable
      data={projects}
      searchPlaceholder="Search projects"
      columns={[
        { key: "name", label: "Project" },
        { key: "status", label: "Status" },
        { key: "progress", label: "Progress" },
        { key: "budget", label: "Budget" },
        { key: "dueDate", label: "Due date" },
      ]}
      renderCell={(project, key) => {
        if (key === "status") return <ProjectStatusBadge status={project.status} />;
        if (key === "progress") return `${project.progress}%`;
        if (key === "budget") return formatCurrency(project.budget);
        if (key === "dueDate") return formatDate(project.dueDate);
        return project[key];
      }}
    />
  );
}
