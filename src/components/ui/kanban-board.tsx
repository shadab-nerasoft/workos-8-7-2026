"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowDown2, MessageText1, Paperclip2 } from "iconsax-react";
import { PriorityBadge } from "@/src/components/ui/badge";
import { useAuthStore, useTaskStore } from "@/src/store";
import { formatDate, titleCase } from "@/src/lib/utils/format";
import { getTaskManager } from "@/src/lib/utils/task-manager";
import type { Task, TaskStatus, User } from "@/src/types";

const columns: TaskStatus[] = ["backlog", "todo", "in-progress", "review", "completed"];
const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: "backlog", label: "Backlog" },
  { value: "todo", label: "Todo" },
  { value: "in-progress", label: "In Progress" },
  { value: "review", label: "Review" },
  { value: "completed", label: "Completed" },
];

export function KanbanBoard({
  tasks,
  users,
  onTaskSelect,
}: {
  tasks: Task[];
  users: User[];
  onTaskSelect?: (task: Task) => void;
}) {
  const [items, setItems] = useState(tasks);
  const [activeId, setActiveId] = useState<string | null>(null);
  const usersById = useMemo(() => new Map(users.map((user) => [user.id, user])), [users]);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  const grouped = useMemo(
    () =>
      columns.map((status) => ({
        status,
        tasks: items.filter((task) => task.status === status),
      })),
    [items],
  );

  const activeTask = activeId ? items.find((t) => t.id === activeId) : undefined;

  const { currentUser } = useAuthStore();
  const updateTaskStatus = useTaskStore((s) => s.moveTask);

  useEffect(() => {
    setItems(tasks);
  }, [tasks]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const taskId = String(event.active.id);
    const task = items.find((t) => t.id === taskId);
    if (currentUser?.role === "employee" && task?.assigneeId !== currentUser.id) {
      return;
    }
    setActiveId(taskId);
  }, [items, currentUser]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeTaskId = String(active.id);
    const overId = String(over.id);

    setItems((current) => {
      const activeTask = current.find((t) => t.id === activeTaskId);
      if (!activeTask) return current;

      const isOverColumn = columns.includes(overId as TaskStatus);
      const overTask = current.find((t) => t.id === overId);

      let targetStatus: TaskStatus;
      if (isOverColumn) {
        targetStatus = overId as TaskStatus;
      } else if (overTask) {
        targetStatus = overTask.status;
      } else {
        return current;
      }

      if (activeTask.status === targetStatus) return current;

      return current.map((t) =>
        t.id === activeTaskId ? { ...t, status: targetStatus } : t,
      );
    });
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const activeTaskId = String(active.id);
    const overId = String(over.id);

    let finalStatus: TaskStatus | null = null;

    setItems((current) => {
      const activeTask = current.find((t) => t.id === activeTaskId);
      if (!activeTask) return current;

      const isOverColumn = columns.includes(overId as TaskStatus);
      if (isOverColumn) {
        finalStatus = overId as TaskStatus;
        return current.map((t) =>
          t.id === activeTaskId ? { ...t, status: overId as TaskStatus } : t,
        );
      }

      const overTask = current.find((t) => t.id === overId);
      if (!overTask) return current;

      finalStatus = overTask.status;
      const statusTasks = current.filter((t) => t.status === finalStatus && t.id !== activeTaskId);
      const overIndex = statusTasks.findIndex((t) => t.id === overId);
      const updatedActive = { ...activeTask, status: finalStatus };

      const newStatusTasks = [...statusTasks];
      newStatusTasks.splice(overIndex, 0, updatedActive);

      const otherTasks = current.filter((t) => t.status !== finalStatus && t.id !== activeTaskId);
      return [...otherTasks, ...newStatusTasks];
    });

    if (finalStatus) {
      updateTaskStatus(activeTaskId, finalStatus);
    }
  }, [updateTaskStatus]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {grouped.map((group) => (
          <KanbanColumn
            key={group.status}
            status={group.status}
            tasks={group.tasks}
            usersById={usersById}
            onStatusChange={updateTaskStatus}
            onTaskSelect={onTaskSelect}
          />
        ))}
      </div>
      <DragOverlay>
        {activeTask ? (
          <TaskCardOverlay
            task={activeTask}
            assignee={usersById.get(activeTask.assigneeId)}
            manager={getTaskManager(activeTask.managerId, activeTask.assigneeId, Array.from(usersById.values()))}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function KanbanColumn({
  status,
  tasks,
  usersById,
  onStatusChange,
  onTaskSelect,
}: {
  status: TaskStatus;
  tasks: Task[];
  usersById: Map<string, User>;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onTaskSelect?: (task: Task) => void;
}) {
  return (
    <SortableContext id={status} items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
      <section className="surface-card flex min-h-[240px] w-[280px] shrink-0 flex-col overflow-hidden border-primary-100/80">
        <div className="flex items-center justify-between border-b px-4 py-3 divider-accent bg-white/80">
          <h2 className="text-sm font-bold leading-6 text-slate-950">{titleCase(status)}</h2>
          <span className="rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-bold leading-5 text-primary-700">
            {tasks.length}
          </span>
        </div>
        <div className="flex-1 space-y-3 bg-slate-50/35 p-3">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              assignee={usersById.get(task.assigneeId)}
              manager={getTaskManager(task.managerId, task.assigneeId, Array.from(usersById.values()))}
              onStatusChange={onStatusChange}
              onTaskSelect={onTaskSelect}
            />
          ))}
          {tasks.length === 0 && (
            <div className="flex min-h-24 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white/70 px-4 text-center text-xs font-medium text-slate-400">
              Drop tasks here
            </div>
          )}
        </div>
      </section>
    </SortableContext>
  );
}

function TaskCard({
  task,
  assignee,
  manager,
  onStatusChange,
  onTaskSelect,
}: {
  task: Task;
  assignee?: User;
  manager?: User;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onTaskSelect?: (task: Task) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onTaskSelect?.(task)}
      className="cursor-grab rounded-2xl border border-primary-200/70 bg-white p-4 shadow-sm outline-none ring-1 ring-transparent transition hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-md focus:ring-2 focus:ring-primary-500 active:cursor-grabbing"
    >
      <TaskCardContent task={task} assignee={assignee} manager={manager} onStatusChange={onStatusChange} />
    </article>
  );
}

function TaskCardOverlay({ task, assignee, manager }: { task: Task; assignee?: User; manager?: User }) {
  return (
    <article className="cursor-grabbing rounded-2xl border border-primary-300 bg-white p-4 shadow-lg ring-2 ring-primary-500/30">
      <TaskCardContent task={task} assignee={assignee} manager={manager} />
    </article>
  );
}

function TaskCardContent({
  task,
  assignee,
  manager,
  onStatusChange,
}: {
  task: Task;
  assignee?: User;
  manager?: User;
  onStatusChange?: (taskId: string, status: TaskStatus) => void;
}) {
  const dueDate = task.deadline ? formatDate(task.deadline) : "No due date";

  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-3">
        {onStatusChange ? (
          <label className="group/status relative inline-flex max-w-[132px] items-center">
            <span className="sr-only">Change task status</span>
            <select
              value={task.status}
              onPointerDown={(event) => event.stopPropagation()}
              onKeyDown={(event) => event.stopPropagation()}
              onChange={(event) => onStatusChange(task.id, event.target.value as TaskStatus)}
              className="h-7 w-full appearance-none rounded-lg border border-primary-200 bg-primary-50 py-1 pl-2.5 pr-7 text-xs font-semibold text-primary-700 outline-none transition hover:border-primary-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ArrowDown2
              size={12}
              color="currentColor"
              variant="Outline"
              aria-hidden="true"
              className="pointer-events-none absolute right-2 text-primary-500"
            />
          </label>
        ) : (
          <span className="rounded-lg border border-primary-200 bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700">
            {titleCase(task.status)}
          </span>
        )}
        <PriorityBadge priority={task.priority} />
      </div>
      <h3 className="line-clamp-2 text-base font-bold leading-6 text-slate-950">{task.title}</h3>
      <p className="mt-1 line-clamp-2 min-h-10 text-xs leading-5 text-slate-500">
        {task.description || "No description added yet."}
      </p>
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-50 text-[11px] font-semibold leading-4 text-primary-700">
            {assignee?.avatar ?? "NA"}
          </span>
          <div className="min-w-0">
            <span className="block text-xs font-medium leading-5 text-slate-500">{dueDate}</span>
            <span className="block truncate text-[11px] font-semibold leading-4 text-slate-400">
              Manager: {manager?.name ?? "Unassigned"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <span className="inline-flex items-center gap-1 text-xs leading-5">
            <MessageText1 size={14} variant="Outline" aria-hidden="true" />
            {task.comments}
          </span>
          <span className="inline-flex items-center gap-1 text-xs leading-5">
            <Paperclip2 size={14} variant="Outline" aria-hidden="true" />
            {task.attachments}
          </span>
        </div>
      </div>
    </>
  );
}
