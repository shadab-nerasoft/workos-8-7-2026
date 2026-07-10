"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useTaskStore, useAuthStore, useProjectStore, useEmployeeStore } from "@/src/store";
import { tasksApi } from "@/src/services";
import { can } from "@/src/lib/permissions";
import { AppShell } from "@/src/components/common/app-shell";
import { CalendarGrid, type CalendarViewMode } from "@/src/components/calendar/calendar-grid";
import { CalendarSidebar } from "@/src/components/calendar/calendar-sidebar";
import { TaskModal } from "@/src/components/projects/task-modal";
import type { Task } from "@/src/types";

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

/**
 * Composition root for the calendar route.
 * Owns all data (stores), permission checks, and the task modal.
 * Child components are pure and receive everything via props.
 */
export default function CalendarPage() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const allTasks = useTaskStore((s) => s.tasks);
  const projects = useProjectStore((s) => s.projectsList);
  const users = useEmployeeStore((s) => s.usersList);

  // Hydration-safe: start null, set on mount
  const [mounted, setMounted] = useState(false);
  const [focusDate, setFocusDate] = useState(() => new Date());
  const [viewMode, setViewMode] = useState<CalendarViewMode>("week");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => { setMounted(true); }, []);

  const weekStart = useMemo(() => getMonday(focusDate), [focusDate]);

  // Filters
  const [selectedAssignees, setSelectedAssignees] = useState<Set<string>>(new Set());
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set(["urgent", "high", "medium", "low"])
  );

  const handleToggleAssignee = useCallback((id: string) => {
    setSelectedAssignees((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleToggleCategory = useCallback((id: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handlePrev = useCallback(() => {
    setFocusDate((prev) => {
      const d = new Date(prev);
      if (viewMode === "day") d.setDate(d.getDate() - 1);
      else if (viewMode === "week") d.setDate(d.getDate() - 7);
      else d.setMonth(d.getMonth() - 1);
      return d;
    });
  }, [viewMode]);

  const handleNext = useCallback(() => {
    setFocusDate((prev) => {
      const d = new Date(prev);
      if (viewMode === "day") d.setDate(d.getDate() + 1);
      else if (viewMode === "week") d.setDate(d.getDate() + 7);
      else d.setMonth(d.getMonth() + 1);
      return d;
    });
  }, [viewMode]);

  const handleDateChange = useCallback((date: Date) => {
    setFocusDate(date);
  }, []);

  // Role-based task scoping, owned by the page
  const tasks = useMemo(() => {
    let visible = allTasks;

    if (currentUser?.role === "employee") {
      visible = visible.filter((t) => t.assigneeId === currentUser.id);
    } else if (currentUser?.role === "manager") {
      const teamProjectIds = new Set(
        projects.filter((p) => p.teamId === currentUser.teamId).map((p) => p.id)
      );
      visible = visible.filter((t) => teamProjectIds.has(t.projectId));
    }

    if (selectedAssignees.size > 0) {
      visible = visible.filter((t) => selectedAssignees.has(t.assigneeId));
    }

    if (selectedCategories.size > 0) {
      visible = visible.filter((t) => selectedCategories.has(t.priority));
    } else {
      visible = [];
    }

    return visible;
  }, [allTasks, currentUser, projects, selectedAssignees, selectedCategories]);

  const canFilterAssignees = currentUser?.role !== "employee";

  if (!mounted) {
    return (
      <AppShell>
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex min-h-[calc(100vh-4rem)] overflow-hidden rounded-xl shadow-sm ring-1 ring-slate-200 m-2 bg-white">
        <CalendarSidebar
          currentWeekStart={weekStart}
          onWeekChange={handleDateChange}
          selectedAssignees={selectedAssignees}
          onToggleAssignee={handleToggleAssignee}
          selectedCategories={selectedCategories}
          onToggleCategory={handleToggleCategory}
          users={users}
          tasks={tasks}
          canFilterAssignees={canFilterAssignees}
        />
        <CalendarGrid
          focusDate={focusDate}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onPrev={handlePrev}
          onNext={handleNext}
          tasks={tasks}
          users={users}
          onTaskSelect={setSelectedTask}
        />
      </div>

      {selectedTask && currentUser && (
        <TaskModal
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          task={selectedTask}
          projectId={selectedTask.projectId}
          users={users}
          isReadOnly={!can(currentUser, "task:edit", { task: selectedTask })}
          lockAssigneeTo={currentUser.role === "employee" ? currentUser.id : null}
          onSubmit={(values) => {
            void tasksApi.updateTask(selectedTask.id, values);
          }}
        />
      )}
    </AppShell>
  );
}
