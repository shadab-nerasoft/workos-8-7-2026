import type { Priority, ProjectStatus, TaskStatus } from "@/src/types";
import { titleCase } from "@/src/lib/utils/format";

type BadgeTone = "primary" | "success" | "warning" | "error" | "muted" | "info";

interface BadgeProps {
  label: string;
  tone?: BadgeTone;
}

const toneClass: Record<BadgeTone, string> = {
  primary: "bg-primary-50 text-primary-700 ring-primary-200",
  success: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  warning: "bg-amber-50 text-amber-700 ring-amber-200",
  error: "bg-red-50 text-red-700 ring-red-200",
  muted: "bg-slate-100 text-slate-600 ring-slate-200",
  info: "bg-cyan-50 text-cyan-700 ring-cyan-200",
};

export function Badge({ label, tone = "muted" }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-sm px-2 py-1 text-[11px] font-medium leading-4 ring-1 ${toneClass[tone]}`}>
      {label}
    </span>
  );
}

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const tone: Record<ProjectStatus, BadgeTone> = {
    planning: "info",
    active: "primary",
    "at-risk": "warning",
    completed: "success",
  };

  return <Badge label={titleCase(status)} tone={tone[status]} />;
}

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const tone: Record<TaskStatus, BadgeTone> = {
    backlog: "muted",
    todo: "info",
    "in-progress": "primary",
    review: "warning",
    completed: "success",
  };

  return <Badge label={titleCase(status)} tone={tone[status]} />;
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const tone: Record<Priority, BadgeTone> = {
    low: "muted",
    medium: "info",
    high: "warning",
    urgent: "error",
  };

  return <Badge label={titleCase(priority)} tone={tone[priority]} />;
}
