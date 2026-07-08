"use client";

import type { TaskActivity } from "@/src/types";
import { formatDate } from "@/src/lib/utils/format";
import { Edit, User, Paperclip, Tag } from "iconsax-react";
import { CheckCircle } from "lucide-react";

interface TaskActivityTimelineProps {
  activities: TaskActivity[];
}

const ACTION_ICONS: Record<string, React.ReactNode> = {
  created: <Edit size={16} className="text-blue-500" />,
  updated: <Edit size={16} className="text-slate-500" />,
  commented: <Paperclip size={16} className="text-green-500" />,
  assigned: <User size={16} className="text-purple-500" />,
  status_changed: <CheckCircle size={16} className="text-amber-500" />,
  priority_changed: <Tag size={16} className="text-red-500" />,
  deadline_changed: <Edit size={16} className="text-orange-500" />,
  attachment_added: <Paperclip size={16} className="text-cyan-500" />,
  label_added: <Tag size={16} className="text-green-500" />,
  label_removed: <Tag size={16} className="text-red-500" />,
};

const ACTION_LABELS: Record<string, string> = {
  created: "Created this task",
  updated: "Updated task",
  commented: "Added a comment",
  assigned: "Assigned task",
  status_changed: "Changed status",
  priority_changed: "Changed priority",
  deadline_changed: "Changed deadline",
  attachment_added: "Added attachment",
  label_added: "Added label",
  label_removed: "Removed label",
};

function formatActivityMessage(activity: TaskActivity): string {
  const label = ACTION_LABELS[activity.action] || activity.action;

  if (activity.action === "status_changed" || activity.action === "priority_changed" || activity.action === "deadline_changed") {
    return `${label} from "${activity.oldValue}" to "${activity.newValue}"`;
  }

  if (activity.action === "assigned") {
    return `${label} to ${activity.newValue}`;
  }

  if (activity.action === "label_added") {
    return `${label}: ${activity.newValue}`;
  }

  if (activity.action === "label_removed") {
    return `${label}: ${activity.oldValue}`;
  }

  return label;
}

export function TaskActivityTimeline({ activities }: TaskActivityTimelineProps) {
  if (activities.length === 0) {
    return <p className="text-center text-sm text-slate-500">No activity yet</p>;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold text-slate-700">Activity History</p>

      <div className="space-y-3">
        {activities.map((activity, index) => (
          <div key={activity.id} className="flex gap-3">
            {/* Timeline dot and line */}
            <div className="flex flex-col items-center">
              <div className="rounded-full bg-white p-1 border border-slate-200">
                {ACTION_ICONS[activity.action] || <Edit size={16} />}
              </div>
              {index !== activities.length - 1 && (
                <div className="h-6 w-0.5 bg-slate-200" />
              )}
            </div>

            {/* Activity details */}
            <div className="flex-1 pt-1">
              <div className="flex items-baseline gap-2">
                <p className="text-sm font-medium text-slate-900">{activity.userName}</p>
                <p className="text-sm text-slate-600">{formatActivityMessage(activity)}</p>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {formatDate(activity.timestamp)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
