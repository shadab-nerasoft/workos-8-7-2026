"use client";

import { useState } from "react";
import type { TaskStatus } from "@/src/types";
import { SearchNormal1, FilterRemove } from "iconsax-react";

interface TaskFilterBarProps {
  onFilterChange: (filters: {
    status?: TaskStatus;
    priority?: string;
    searchQuery: string;
  }) => void;
  onReset?: () => void;
}

const STATUS_OPTIONS: TaskStatus[] = ["backlog", "todo", "in-progress", "review", "completed"];
const PRIORITY_OPTIONS: string[] = ["low", "medium", "high", "urgent"];

export function TaskFilterBar({ onFilterChange, onReset }: TaskFilterBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | undefined>(undefined);
  const [selectedPriority, setSelectedPriority] = useState<string | undefined>(undefined);
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onFilterChange({ status: selectedStatus, priority: selectedPriority, searchQuery: query });
  };

  const handleStatusChange = (status: TaskStatus) => {
    const newStatus = selectedStatus === status ? undefined : status;
    setSelectedStatus(newStatus);
    onFilterChange({ status: newStatus, priority: selectedPriority, searchQuery });
  };

  const handlePriorityChange = (priority: string) => {
    const newPriority = selectedPriority === priority ? undefined : priority;
    setSelectedPriority(newPriority);
    onFilterChange({ status: selectedStatus, priority: newPriority, searchQuery });
  };

  const handleReset = () => {
    setSearchQuery("");
    setSelectedStatus(undefined);
    setSelectedPriority(undefined);
    onReset?.();
  };

  const activeFiltersCount = [selectedStatus, selectedPriority, searchQuery ? 1 : 0].filter(Boolean).length;

  return (
    <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex gap-2">
        <div className="flex-1">
          <div className="relative">
            <SearchNormal1 className="absolute left-3 top-3 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="relative rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          Filters {activeFiltersCount > 0 && <span className="ml-1 inline-block rounded-full bg-primary-500 px-2 py-0.5 text-xs font-semibold text-white">{activeFiltersCount}</span>}
        </button>
        {activeFiltersCount > 0 && (
          <button
            onClick={handleReset}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <FilterRemove size={18} />
          </button>
        )}
      </div>

      {showFilters && (
        <div className="space-y-3 border-t border-slate-200 pt-3">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase text-slate-700">Status</p>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    selectedStatus === status
                      ? "bg-primary-500 text-white"
                      : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase text-slate-700">Priority</p>
            <div className="flex flex-wrap gap-2">
              {PRIORITY_OPTIONS.map((priority) => (
                <button
                  key={priority}
                  onClick={() => handlePriorityChange(priority)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    selectedPriority === priority
                      ? "bg-primary-500 text-white"
                      : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                  }`}
                >
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
