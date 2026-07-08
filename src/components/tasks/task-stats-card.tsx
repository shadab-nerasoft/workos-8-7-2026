"use client";

import { Clock, Briefcase } from "iconsax-react";
import { CheckCircle as CheckCircleIcon } from "lucide-react";

interface TaskStatsCardProps {
  total: number;
  completed: number;
  inProgress: number;
  overdue: number;
}

export function TaskStatsCard({ total, completed, inProgress, overdue }: TaskStatsCardProps) {
  const stats = [
    {
      label: "Total Tasks",
      value: total,
      icon: Briefcase,
      color: "text-slate-600 bg-slate-100",
    },
    {
      label: "In Progress",
      value: inProgress,
      icon: Clock,
      color: "text-blue-600 bg-blue-100",
    },
    {
      label: "Completed",
      value: completed,
      icon: CheckCircleIcon,
      color: "text-green-600 bg-green-100",
    },
    {
      label: "Overdue",
      value: overdue,
      icon: Clock,
      color: "text-red-600 bg-red-100",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">{stat.label}</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
              <div className={`rounded-lg p-3 ${stat.color}`}>
                <Icon size={20} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
