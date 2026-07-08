"use client";

import { useMemo, useState } from "react";
import type { ArchivedTask } from "@/src/types";
import { Trash } from "iconsax-react";
import { RotateCcw } from "lucide-react";
import { formatDate } from "@/src/lib/utils/format";

interface TaskArchiveProps {
  archivedTasks: ArchivedTask[];
  onRestore?: (taskId: string) => void;
  onPermanentlyDelete?: (taskId: string) => void;
}

export function TaskArchive({ archivedTasks, onRestore, onPermanentlyDelete }: TaskArchiveProps) {
  const [filter, setFilter] = useState<"all" | "recent" | "old">("all");

  const filtered = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const threshold = thirtyDaysAgo.getTime();

    return archivedTasks.filter((at) => {
      const archivedTime = new Date(at.archivedAt).getTime();
      if (filter === "recent") return archivedTime > threshold;
      if (filter === "old") return archivedTime <= threshold;
      return true;
    });
  }, [archivedTasks, filter]);

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(["all", "recent", "old"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filter === f
                ? "bg-primary-600 text-white"
                : "border border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Archive List */}
      <div className="space-y-2">
        {filtered.map((archived) => (
          <div
            key={archived.id}
            className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:border-slate-300 group"
          >
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-slate-900 truncate">{archived.task.title}</h4>
              <div className="flex items-center gap-2 mt-1 text-xs text-slate-600">
                <span>Archived {formatDate(archived.archivedAt)}</span>
                {archived.reason && (
                  <>
                    <span>•</span>
                    <span>{archived.reason}</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <button
                onClick={() => onRestore?.(archived.task.id)}
                className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-blue-600"
                title="Restore"
              >
                <RotateCcw size={18} />
              </button>
              <button
                onClick={() => onPermanentlyDelete?.(archived.task.id)}
                className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600"
                title="Delete permanently"
              >
                <Trash size={18} />
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <p className="text-sm">No archived tasks</p>
          </div>
        )}
      </div>
    </div>
  );
}
