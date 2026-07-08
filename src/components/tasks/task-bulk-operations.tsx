"use client";

import type { TaskStatus } from "@/src/types";
import { Trash, Archive } from "iconsax-react";

interface TaskBulkOperationsProps {
  selectedTaskIds: string[];
  onChangeStatus?: (taskIds: string[], status: TaskStatus) => void;
  onChangeAssignee?: (taskIds: string[], assigneeId: string) => void;
  onArchive?: (taskIds: string[]) => void;
  onDelete?: (taskIds: string[]) => void;
  onClear?: () => void;
}

export function TaskBulkOperations({
  selectedTaskIds,
  onChangeStatus,
  onArchive,
  onDelete,
  onClear,
}: TaskBulkOperationsProps) {
  if (selectedTaskIds.length === 0) return null;

  const statuses: TaskStatus[] = ["backlog", "todo", "in-progress", "review", "completed"];

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white border border-slate-200 rounded-lg shadow-lg p-4 flex items-center gap-4 max-w-2xl">
      <span className="text-sm font-medium text-slate-700">
        {selectedTaskIds.length} task{selectedTaskIds.length !== 1 ? "s" : ""} selected
      </span>

      <div className="flex items-center gap-2 flex-1 overflow-x-auto">
        {/* Status Dropdown */}
        <select
          onChange={(e) => {
            if (e.target.value) {
              onChangeStatus?.(selectedTaskIds, e.target.value as TaskStatus);
              e.target.value = "";
            }
          }}
          className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Change status</option>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>

        {/* Priority Dropdown */}
        <select
          onChange={(e) => {
            if (e.target.value) {
              // Handle priority change
              e.target.value = "";
            }
          }}
          className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Change priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => onArchive?.(selectedTaskIds)}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600 hover:text-slate-900"
          title="Archive"
        >
          <Archive size={18} />
        </button>
        <button
          onClick={() => onDelete?.(selectedTaskIds)}
          className="p-2 hover:bg-red-50 rounded-lg transition-colors text-slate-600 hover:text-red-600"
          title="Delete"
        >
          <Trash size={18} />
        </button>
        <button
          onClick={() => {
            onClear?.();
          }}
          className="px-3 py-1.5 text-sm border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
