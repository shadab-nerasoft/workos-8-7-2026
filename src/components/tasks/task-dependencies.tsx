"use client";

import { useState } from "react";
import type { TaskDependency } from "@/src/types";
import { ArrowRight, Trash, Add } from "iconsax-react";

type DependencyType = TaskDependency["type"];

interface TaskDependenciesProps {
  taskId: string;
  dependencies: TaskDependency[];
  blockingTasks: string[];
  onAddDependency: (dependency: TaskDependency) => void;
  onRemoveDependency: (dependencyId: string) => void;
  getTaskTitle: (taskId: string) => string;
}

export function TaskDependencies({
  taskId,
  dependencies,
  blockingTasks,
  onAddDependency,
  onRemoveDependency,
  getTaskTitle,
}: TaskDependenciesProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedType, setSelectedType] = useState<DependencyType>("blocked-by");
  const [selectedTaskId, setSelectedTaskId] = useState("");

  const dependencyTypes = [
    { value: "blocks" as const, label: "blocks", description: "This task blocks another" },
    { value: "blocked-by" as const, label: "blocked by", description: "This task is blocked by another" },
    { value: "relates-to" as const, label: "relates to", description: "Related task" },
    { value: "duplicate" as const, label: "duplicate", description: "Duplicate task" },
  ];

  const handleAddDependency = () => {
    if (selectedTaskId && selectedTaskId !== taskId) {
      const dependency: TaskDependency = {
        id: `dep-${Date.now()}`,
        sourceTaskId: taskId,
        targetTaskId: selectedTaskId,
        type: selectedType,
        createdAt: new Date().toISOString(),
        createdBy: "current-user",
      };
      onAddDependency(dependency);
      setIsAdding(false);
      setSelectedTaskId("");
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-slate-900">Dependencies</h3>

      {/* Dependencies List */}
      <div className="space-y-2">
        {dependencies.map((dep) => (
          <div key={dep.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 group">
            <span className="text-xs font-medium bg-slate-100 text-slate-700 px-2 py-1 rounded">
              {dep.type}
            </span>
            <ArrowRight size={16} className="text-slate-400" />
            <span className="flex-1 text-sm text-slate-900">{getTaskTitle(dep.targetTaskId)}</span>
            <button
              onClick={() => onRemoveDependency(dep.id)}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded transition-all"
            >
              <Trash size={16} className="text-red-600" />
            </button>
          </div>
        ))}
      </div>

      {/* Blocking Tasks */}
      {blockingTasks.length > 0 && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm font-medium text-amber-900">Blocks {blockingTasks.length} task(s):</p>
          <div className="mt-2 space-y-1">
            {blockingTasks.map((bid) => (
              <div key={bid} className="text-sm text-amber-800">
                • {getTaskTitle(bid)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Dependency */}
      {isAdding ? (
        <div className="space-y-3 p-3 border border-slate-200 rounded-lg">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as DependencyType)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {dependencyTypes.map((dt) => (
              <option key={dt.value} value={dt.value}>
                {dt.label} - {dt.description}
              </option>
            ))}
          </select>
          <input
            autoFocus
            type="text"
            value={selectedTaskId}
            onChange={(e) => setSelectedTaskId(e.target.value)}
            placeholder="Enter related task ID"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddDependency}
              className="flex-1 px-3 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700"
            >
              Add
            </button>
            <button
              onClick={() => setIsAdding(false)}
              className="flex-1 px-3 py-2 border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
        >
          <Add size={16} />
          Add dependency
        </button>
      )}
    </div>
  );
}
