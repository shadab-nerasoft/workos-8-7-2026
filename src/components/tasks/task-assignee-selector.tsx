"use client";

import { useState, useRef, useEffect } from "react";
import type { User } from "@/src/types";
import { SearchNormal1, CloseCircle } from "iconsax-react";

interface TaskAssigneeSelectorProps {
  assignees: User[];
  selectedAssigneeId: string;
  onAssigneeChange: (userId: string) => void;
  currentUserId?: string;
}

export function TaskAssigneeSelector({ assignees, selectedAssigneeId, onAssigneeChange }: TaskAssigneeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredAssignees = assignees.filter((u) => u.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const selectedAssignee = assignees.find((u) => u.id === selectedAssigneeId);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (userId: string) => {
    onAssigneeChange(userId);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm hover:border-slate-300 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
      >
        {selectedAssignee ? (
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center text-xs font-semibold text-white">
              {selectedAssignee.name.charAt(0)}
            </div>
            <span className="text-slate-700">{selectedAssignee.name}</span>
          </div>
        ) : (
          <span className="text-slate-500">Select assignee...</span>
        )}
        <SearchNormal1 size={16} className="text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute top-full z-10 mt-2 w-full rounded-lg border border-slate-200 bg-white shadow-lg">
          {/* Search Input */}
          <div className="border-b border-slate-200 p-2">
            <input
              type="text"
              placeholder="Search team members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="w-full rounded px-3 py-2 text-sm border border-slate-200 focus:border-primary-500 focus:outline-none"
            />
          </div>

          {/* Assignee List */}
          <div className="max-h-64 overflow-y-auto">
            {filteredAssignees.length > 0 ? (
              filteredAssignees.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleSelect(user.id)}
                  className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-slate-100 ${
                    selectedAssigneeId === user.id ? "bg-primary-50" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center text-xs font-semibold text-white">
                      {user.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                    {selectedAssigneeId === user.id && <div className="h-2 w-2 rounded-full bg-primary-500" />}
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-center text-sm text-slate-500">No team members found</div>
            )}
          </div>

          {/* Clear Selection */}
          {selectedAssigneeId && (
            <div className="border-t border-slate-200 p-2">
              <button
                onClick={() => handleSelect("")}
                className="w-full rounded px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 flex items-center justify-center gap-2"
              >
                <CloseCircle size={16} />
                Clear Assignment
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
