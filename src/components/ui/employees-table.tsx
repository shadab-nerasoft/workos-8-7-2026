"use client";

import Link from "next/link";
import { useAuthStore, useEmployeeStore } from "@/src/store";
import { Eye, Clock, Trash } from "iconsax-react";
import type { User } from "@/src/types";

export function EmployeesTable({ users }: { users: User[] }) {
  const { currentUser } = useAuthStore();
  const deleteUser = useEmployeeStore((s) => s.deleteUser);

  const isAdmin = currentUser?.role === "admin";

  const getAvatarBg = (name: string) => {
    const code = name.charCodeAt(0) + (name.charCodeAt(1) || 0);
    const colors = [
      "bg-blue-50 text-blue-600 border-blue-100",
      "bg-emerald-50 text-emerald-700 border-emerald-100",
      "bg-amber-50 text-amber-700 border-amber-100",
      "bg-pink-50 text-pink-700 border-pink-100",
      "bg-purple-50 text-purple-700 border-purple-100",
      "bg-cyan-50 text-cyan-700 border-cyan-100",
    ];
    return colors[code % colors.length];
  };

  const handleDelete = (userId: string, userName: string) => {
    if (confirm(`Are you sure you want to delete employee profile for ${userName}?`)) {
      deleteUser(userId);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mt-4">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-bold text-slate-700 text-xs uppercase tracking-wider">Employee ID</th>
              <th className="px-6 py-4 font-bold text-slate-700 text-xs uppercase tracking-wider">Employee Name</th>
              <th className="px-6 py-4 font-bold text-slate-700 text-xs uppercase tracking-wider">Role / Dept</th>
              <th className="px-6 py-4 text-right font-bold text-slate-700 text-xs uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50/50 transition">
                {/* Employee ID */}
                <td className="px-6 py-4 font-semibold text-slate-900 text-sm">
                  {user.id}
                </td>

                {/* Employee Name */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold border ${getAvatarBg(user.name)}`}>
                      {user.avatar || user.name.slice(0, 2).toUpperCase()}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-950">{user.name}</span>
                      <span className="text-xs text-slate-500 font-medium">{user.email}</span>
                    </div>
                  </div>
                </td>

                {/* Role / Dept */}
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-900">{user.department || "Technology"}</span>
                    <span className="text-xs text-slate-500 font-medium">{user.title}</span>
                  </div>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-6">
                    <Link
                      href={`/employees/${user.id}`}
                      className="text-primary-600 hover:text-primary-700 font-bold text-xs inline-flex items-center gap-1.5 transition"
                    >
                      <Eye size={16} color="#2563eb" variant="Outline" />
                      View Detail
                    </Link>
                    <Link
                      href={`/employees/${user.id}/history`}
                      className="text-slate-650 hover:text-slate-800 font-bold text-xs inline-flex items-center gap-1.5 transition"
                    >
                      <Clock size={16} color="#475569" variant="Outline" />
                      History
                    </Link>
                    {isAdmin && currentUser?.id !== user.id && (
                      <button
                        onClick={() => handleDelete(user.id, user.name)}
                        className="text-red-500 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition cursor-pointer"
                        title="Delete Profile"
                      >
                        <Trash size={16} color="#ef4444" variant="Outline" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
