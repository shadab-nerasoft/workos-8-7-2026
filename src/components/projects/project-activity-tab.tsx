"use client";

import { useState } from "react";
import { useEmployeeStore, useActivityStore } from "@/src/store";
import { formatDate } from "@/src/lib/utils/format";

export function ProjectActivityTab({ projectId }: { projectId: string }) {
  const users = useEmployeeStore((s) => s.usersList);
  const activities = useActivityStore((s) => s.activities).filter(
    (act) => act.projectId === projectId
  );

  const [visibleCount, setVisibleCount] = useState(10);
  const displayedActivities = activities.slice(0, visibleCount);

  const getUser = (id: string) => users.find((u) => u.id === id);

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-slate-200 rounded-[var(--radius)] bg-slate-50/50 max-w-3xl">
        <p className="text-sm font-semibold text-slate-900">No activity yet</p>
        <p className="mt-1 text-xs text-slate-500 max-w-xs">
          Activities will show up here as tasks are updated, assigned, or completed.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Recent Activity</h2>
        <span className="text-xs text-slate-500 font-medium">
          Showing {displayedActivities.length} of {activities.length} activities
        </span>
      </div>

      <div className="relative border-l border-slate-200 ml-4 pl-6 flex flex-col gap-8">
        {displayedActivities.map((item) => {
          const user = getUser(item.actorId);

          return (
            <div key={item.id} className="relative">
              {/* Timeline Dot */}
              <div className="absolute -left-[31px] flex h-4 w-4 items-center justify-center rounded-full bg-white ring-2 ring-primary-500">
                <div className="h-1.5 w-1.5 rounded-full bg-primary-500"></div>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  {user ? (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-[10px] font-bold text-primary-700 shadow-sm ring-1 ring-white">
                      {user.avatar}
                    </div>
                  ) : (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-500 shadow-sm ring-1 ring-white">
                      NA
                    </div>
                  )}
                  <p className="text-sm text-slate-700">
                    <span className="font-semibold text-slate-900">
                      {user?.name || "Unknown User"}
                    </span>{" "}
                    {item.action}{" "}
                    <span className="font-medium text-slate-900">
                      {item.subject}
                    </span>
                  </p>
                </div>
                <span className="text-xs text-slate-500 ml-8">
                  {formatDate(item.timestamp)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {activities.length > visibleCount && (
        <div className="mt-2 ml-4">
          <button
            onClick={() => setVisibleCount((prev) => prev + 10)}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-[var(--radius)] bg-white px-4 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 transition hover:bg-slate-50 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 active:bg-slate-100"
          >
            Load More ({activities.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </div>
  );
}
