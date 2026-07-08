"use client";

import { useState } from "react";
import type { Task, TaskStatus, TaskSearchFilter } from "@/src/types";
import { SearchNormal1 } from "iconsax-react";

interface AdvancedTaskSearchProps {
  allTasks: Task[];
  onSearch: (tasks: Task[]) => void;
  onSaveFilter?: (filter: TaskSearchFilter) => void;
  savedFilters?: TaskSearchFilter[];
}

export function AdvancedTaskSearch({
  allTasks,
  onSearch,
  onSaveFilter,
  savedFilters = [],
}: AdvancedTaskSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<{
    status?: TaskStatus[];
    priority?: string[];
    assignee?: string[];
  }>({});
  const [filterName, setFilterName] = useState("");

  const statuses: TaskStatus[] = ["backlog", "todo", "in-progress", "review", "completed"];
  const priorities = ["low", "medium", "high", "urgent"];

  const applyFilters = () => {
    let results = allTasks;

    // Text search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (filters.status && filters.status.length > 0) {
      results = results.filter((t) => filters.status?.includes(t.status));
    }

    // Priority filter
    if (filters.priority && filters.priority.length > 0) {
      results = results.filter((t) => filters.priority?.includes(t.priority));
    }

    // Assignee filter
    if (filters.assignee && filters.assignee.length > 0) {
      results = results.filter((t) => filters.assignee?.includes(t.assigneeId));
    }

    onSearch(results);
  };

  const handleStatusToggle = (status: TaskStatus) => {
    setFilters((prev) => ({
      ...prev,
      status: prev.status?.includes(status)
        ? prev.status.filter((s) => s !== status)
        : [...(prev.status || []), status],
    }));
  };

  const handlePriorityToggle = (priority: string) => {
    setFilters((prev) => ({
      ...prev,
      priority: prev.priority?.includes(priority)
        ? prev.priority.filter((p) => p !== priority)
        : [...(prev.priority || []), priority],
    }));
  };

  const handleSaveFilter = () => {
    if (filterName.trim()) {
      const newFilter: TaskSearchFilter = {
        id: `filter-${Date.now()}`,
        name: filterName,
        conditions: [
          ...(filters.status?.map((s) => ({
            field: "status" as const,
            operator: "equals" as const,
            value: s,
          })) || []),
          ...(filters.priority?.map((p) => ({
            field: "priority" as const,
            operator: "equals" as const,
            value: p,
          })) || []),
        ],
        createdBy: "current-user",
        createdAt: new Date().toISOString(),
      };
      onSaveFilter?.(newFilter);
      setFilterName("");
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <SearchNormal1 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              applyFilters();
            }}
            placeholder="Search tasks..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`px-4 py-2 rounded-lg border transition-colors ${
            isOpen
              ? "bg-primary-50 border-primary-200 text-primary-700"
              : "border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          Filters
        </button>
      </div>

      {/* Filters Panel */}
      {isOpen && (
        <div className="space-y-4 p-4 border border-slate-200 rounded-lg bg-slate-50">
          {/* Status Filter */}
          <div>
            <label className="text-sm font-medium text-slate-900 block mb-2">Status</label>
            <div className="flex flex-wrap gap-2">
              {statuses.map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusToggle(status)}
                  className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                    filters.status?.includes(status)
                      ? "bg-primary-600 text-white"
                      : "border border-slate-300 text-slate-700 hover:bg-white"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="text-sm font-medium text-slate-900 block mb-2">Priority</label>
            <div className="flex flex-wrap gap-2">
              {priorities.map((priority) => (
                <button
                  key={priority}
                  onClick={() => handlePriorityToggle(priority)}
                  className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                    filters.priority?.includes(priority)
                      ? "bg-primary-600 text-white"
                      : "border border-slate-300 text-slate-700 hover:bg-white"
                  }`}
                >
                  {priority}
                </button>
              ))}
            </div>
          </div>

          {/* Save Filter */}
          <div className="flex gap-2 pt-2 border-t border-slate-200">
            <input
              type="text"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              placeholder="Save filter as..."
              className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button
              onClick={handleSaveFilter}
              className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* Saved Filters */}
      {savedFilters.length > 0 && (
        <div>
          <label className="text-sm font-medium text-slate-900 block mb-2">Quick Filters</label>
          <div className="flex flex-wrap gap-2">
            {savedFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => {
                  // Apply saved filter
                  applyFilters();
                }}
                className="px-3 py-1.5 text-sm bg-white border border-slate-200 text-slate-700 rounded-full hover:bg-slate-50 transition-colors"
              >
                {filter.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
