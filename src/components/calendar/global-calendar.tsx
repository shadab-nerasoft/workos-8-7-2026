"use client";

import { useState, useMemo } from "react";
import { useEmployeeStore } from "@/src/store";
import { TaskModal } from "@/src/components/projects/task-modal";
import { ArrowLeft2, ArrowRight2 } from "iconsax-react";
import type { Task } from "@/src/types";

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function GlobalCalendar({ tasks }: { tasks: Task[] }) {
  const users = useEmployeeStore((s) => s.usersList);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getUser = (id: string) => users.find((u) => u.id === id);

  // Group tasks by date
  const tasksByDate = useMemo(() => {
    const map = new Map<number, Task[]>();
    tasks.forEach((task) => {
      const taskDate = new Date(task.deadline);
      if (taskDate.getFullYear() === year && taskDate.getMonth() === month) {
        const date = taskDate.getDate();
        if (!map.has(date)) map.set(date, []);
        map.get(date)!.push(task);
      }
    });
    return map;
  }, [tasks, year, month]);

  const monthName = currentDate.toLocaleString("default", { month: "long" });

  return (
    <div className="flex flex-col gap-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-xl font-bold text-slate-900">
          {monthName} {year}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            <ArrowLeft2 size={18} />
          </button>
          <button
            onClick={handleNextMonth}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            <ArrowRight2 size={18} />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
          {DAYS_OF_WEEK.map((day) => (
            <div
              key={day}
              className="px-4 py-3 text-center text-xs font-semibold uppercase text-slate-500"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Body */}
        <div className="grid grid-cols-7">
          {/* Empty cells before the first day */}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[120px] border-b border-r border-slate-100 bg-slate-50/50 p-2" />
          ))}

          {/* Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const date = i + 1;
            const isToday =
              date === new Date().getDate() &&
              month === new Date().getMonth() &&
              year === new Date().getFullYear();
            const dayTasks = tasksByDate.get(date) || [];

            return (
              <div
                key={date}
                className={`group min-h-[120px] border-b border-r border-slate-100 p-2 transition-colors hover:bg-slate-50 ${isToday ? "bg-primary-50/30" : ""}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${
                      isToday ? "bg-primary-600 text-white shadow-sm" : "text-slate-700"
                    }`}
                  >
                    {date}
                  </span>
                  {dayTasks.length > 0 && (
                    <span className="text-[10px] font-semibold text-slate-400">
                      {dayTasks.length} {dayTasks.length === 1 ? 'task' : 'tasks'}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  {dayTasks.map((task) => {
                    const assignee = getUser(task.assigneeId);
                    return (
                      <div
                        key={task.id}
                        onClick={() => setSelectedTask(task)}
                        className="cursor-pointer rounded-md border border-slate-200 bg-white px-2 py-1.5 shadow-sm transition-all hover:border-primary-400 hover:shadow"
                      >
                        <p className="line-clamp-1 text-xs font-semibold text-slate-700">
                          {task.title}
                        </p>
                        {assignee && (
                          <div className="mt-1 flex items-center gap-1">
                            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary-100 text-[8px] font-bold text-primary-700">
                              {assignee.avatar}
                            </div>
                            <span className="text-[10px] text-slate-500 line-clamp-1">{assignee.name}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedTask && (
        <TaskModal
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          task={selectedTask}
          projectId={selectedTask.projectId}
        />
      )}
    </div>
  );
}
