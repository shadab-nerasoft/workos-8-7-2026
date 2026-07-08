"use client";

import { useState } from "react";
import type { TaskNotification } from "@/src/types";
import { CloseCircle } from "iconsax-react";
import { Bell } from "lucide-react";
import { formatDate } from "@/src/lib/utils/format";

interface TaskNotificationsProps {
  notifications: TaskNotification[];
  onMarkRead?: (notificationId: string) => void;
  onDismiss?: (notificationId: string) => void;
}

export function TaskNotifications({
  notifications,
  onMarkRead,
  onDismiss,
}: TaskNotificationsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const getNotificationIcon = (type: TaskNotification["type"]) => {
    switch (type) {
      case "assigned":
        return "👤";
      case "mentioned":
        return "@";
      case "status_changed":
        return "↔️";
      case "deadline_approaching":
        return "⏰";
      case "commented":
        return "💬";
      case "dependency_blocked":
        return "🚫";
      default:
        return "📢";
    }
  };

  const getNotificationColor = (type: TaskNotification["type"]) => {
    switch (type) {
      case "assigned":
        return "bg-blue-50 border-blue-200";
      case "mentioned":
        return "bg-purple-50 border-purple-200";
      case "status_changed":
        return "bg-green-50 border-green-200";
      case "deadline_approaching":
        return "bg-amber-50 border-amber-200";
      case "commented":
        return "bg-slate-50 border-slate-200";
      case "dependency_blocked":
        return "bg-red-50 border-red-200";
      default:
        return "bg-slate-50 border-slate-200";
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors"
      >
        <Bell size={20} className="text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white border border-slate-200 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
          <div className="sticky top-0 bg-white border-b border-slate-200 px-4 py-3">
            <h3 className="font-semibold text-slate-900">Notifications</h3>
          </div>

          {notifications.length > 0 ? (
            <div className="divide-y divide-slate-200">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-l-4 transition-colors cursor-pointer hover:bg-slate-50 ${
                    notification.read ? "opacity-60" : ""
                  } ${
                    getNotificationColor(notification.type)
                  }`}
                  onClick={() => {
                    if (!notification.read) {
                      onMarkRead?.(notification.id);
                    }
                  }}
                >
                  <div className="flex gap-3">
                    <span className="text-lg flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        {formatDate(notification.createdAt)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDismiss?.(notification.id);
                      }}
                      className="opacity-0 hover:opacity-100 p-1 hover:bg-slate-200 rounded transition-all flex-shrink-0"
                    >
                      <CloseCircle size={16} className="text-slate-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-sm text-slate-500">No notifications</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
