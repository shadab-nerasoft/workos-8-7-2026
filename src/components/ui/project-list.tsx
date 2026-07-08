"use client";

import { useRouter } from "next/navigation";
import { ProjectStatusBadge } from "@/src/components/ui/badge";
import { formatDate } from "@/src/lib/utils/format";
import type { Project, Team, User } from "@/src/types";

export function ProjectList({ projects, teams, users }: { projects: Project[]; teams: Team[]; users: User[] }) {
  const router = useRouter();
  const teamsById = new Map(teams.map((team) => [team.id, team]));
  const usersById = new Map(users.map((user) => [user.id, user]));

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left">
        <thead className="border-b text-xs uppercase leading-5 text-slate-500 divider-accent">
          <tr>
            <th className="px-5 py-3 font-semibold">Project</th>
            <th className="px-5 py-3 font-semibold">Manager</th>
            <th className="px-5 py-3 font-semibold">Team</th>
            <th className="px-5 py-3 font-semibold">Status</th>
            <th className="px-5 py-3 font-semibold">Progress</th>
            <th className="px-5 py-3 font-semibold">Due</th>
          </tr>
        </thead>
        <tbody className="divide-y divider-accent">
          {projects.map((project) => (
            <tr 
              key={project.id} 
              onClick={() => router.push(`/projects/${project.id}`)}
              className="hover:bg-primary-50/40 transition cursor-pointer"
            >
              <td className="px-5 py-4 text-sm font-semibold leading-6 text-slate-950">{project.name}</td>
              <td className="px-5 py-4 text-sm leading-6 text-slate-600">{usersById.get(project.ownerId)?.name ?? "Unassigned"}</td>
              <td className="px-5 py-4 text-sm leading-6 text-slate-600">{teamsById.get(project.teamId)?.name ?? "No team"}</td>
              <td className="px-5 py-4"><ProjectStatusBadge status={project.status} /></td>
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-24 rounded-sm bg-slate-100">
                    <div className="h-2 rounded-sm bg-primary-600" style={{ width: `${project.progress}%` }} />
                  </div>
                  <span className="text-sm leading-6 text-slate-600">{project.progress}%</span>
                </div>
              </td>
              <td className="px-5 py-4 text-sm leading-6 text-slate-600">{formatDate(project.dueDate)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
