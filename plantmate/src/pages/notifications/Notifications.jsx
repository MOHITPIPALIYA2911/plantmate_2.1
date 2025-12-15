// src/pages/notifications/Notifications.jsx
import React, { useEffect, useState } from "react";
import {
  FaBell,
  FaLeaf,
  FaCalendarAlt,
  FaCheckCircle,
  FaExclamationCircle,
  FaTimes,
  FaClock,
  FaMapMarkerAlt,
} from "react-icons/fa";
import api from "../../lib/api";

function normalizeNotifications(data) {
  const list = Array.isArray(data)
    ? data
    : data?.notifications || data?.items || [];

  return list.map((n) => ({
    id: n._id || n.id,
    type: n.type || "generic", // "care", "calendar", etc.
    title: n.title || "Notification",
    message: n.message || n.body || "",
    read: !!n.read,
    createdAt: n.createdAt || n.triggerAt || n.date,
    dueAt: n.dueAt,
    plantName: n.plant_name,
    spaceName: n.space_name,
    taskType: n.task_type,
    meta: n.meta || {},
  }));
}

function typeIcon(type) {
  switch (type) {
    case "care":
    case "care_task":
      return (
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-700">
          <FaLeaf />
        </span>
      );
    case "calendar":
    case "event":
      return (
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700">
          <FaCalendarAlt />
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-700">
          <FaBell />
        </span>
      );
  }
}

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  const unreadCount = items.filter((n) => !n.read).length;

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/notifications", {
        params: { limit: 100 },
      });
      setItems(normalizeNotifications(data));
    } catch (e) {
      console.error("Failed to load notifications", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const markAllRead = async () => {
    if (!unreadCount) return;
    setMarking(true);
    try {
      await api.post("/api/notifications/mark-all-read");
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (e) {
      console.error("Failed to mark all read", e);
    } finally {
      setMarking(false);
    }
  };

  const fmtDateTime = (value) => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString([], {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const fmtFullDateTime = (value) => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString([], {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleNotificationClick = async (notification) => {
    setSelectedNotification(notification);
    
    // Mark as read if unread
    if (!notification.read) {
      try {
        await api.post(`/api/notifications/${notification.id}/read`);
        setItems((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
        );
      } catch (e) {
        console.error("Failed to mark notification as read", e);
      }
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center justify-center w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
            <FaBell />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-emerald-900 dark:text-slate-100">
              Notifications
            </h1>
            <p className="text-sm text-emerald-800/80 dark:text-slate-300/80">
              Care tasks & calendar reminders in one place.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={markAllRead}
          disabled={!unreadCount || marking}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm sm:text-base ${
            unreadCount
              ? "bg-emerald-600 text-white hover:bg-emerald-700"
              : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 cursor-default"
          }`}
        >
          <FaCheckCircle />
          {unreadCount
            ? marking
              ? "Marking…"
              : `Mark all read (${unreadCount})`
            : "All caught up"}
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-emerald-200 dark:border-emerald-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 text-sm text-emerald-800 dark:text-emerald-100">
            Loading notifications…
          </div>
        ) : items.length === 0 ? (
          <div className="p-6 text-sm text-emerald-800 dark:text-emerald-100">
            No notifications yet. Care tasks and calendar events will show up
            here.
          </div>
        ) : (
          <ul className="divide-y divide-emerald-100 dark:divide-slate-700">
            {items.map((n) => (
              <li
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={`p-3 sm:p-4 flex items-start gap-3 sm:gap-4 cursor-pointer hover:bg-emerald-50/80 dark:hover:bg-emerald-900/30 transition-colors ${
                  !n.read
                    ? "bg-emerald-50/60 dark:bg-emerald-900/20"
                    : "bg-white dark:bg-slate-800"
                }`}
              >
                {typeIcon(n.type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm sm:text-base font-semibold text-emerald-900 dark:text-slate-100">
                        {n.title}
                      </div>
                      {n.message && (
                        <p className="mt-0.5 text-xs sm:text-sm text-emerald-800/90 dark:text-slate-200/90 line-clamp-2">
                          {n.message}
                        </p>
                      )}
                    </div>
                    <div className="text-[11px] sm:text-xs text-emerald-700/80 dark:text-slate-300/80 whitespace-nowrap">
                      {fmtDateTime(n.createdAt)}
                    </div>
                  </div>
                  {!n.read && (
                    <div className="mt-1 inline-flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-300">
                      <FaExclamationCircle className="text-[10px]" />
                      New
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selectedNotification && (
        <NotificationModal
          notification={selectedNotification}
          onClose={() => setSelectedNotification(null)}
          fmtFullDateTime={fmtFullDateTime}
        />
      )}
    </div>
  );
}

function NotificationModal({ notification, onClose, fmtFullDateTime }) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden my-4 sm:my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 sm:px-5 py-3 border-b border-gray-200 dark:border-slate-700 bg-emerald-600 text-white font-semibold text-sm sm:text-base flex items-center justify-between">
          <span>Notification Details</span>
          <button
            onClick={onClose}
            className="text-white hover:text-emerald-100 transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          <div className="flex items-start gap-4">
            {typeIcon(notification.type)}
            <div className="flex-1">
              <h2 className="text-lg sm:text-xl font-semibold text-emerald-900 dark:text-slate-100">
                {notification.title}
              </h2>
              {!notification.read && (
                <div className="mt-1 inline-flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/40 px-2 py-1 rounded-full">
                  <FaExclamationCircle className="text-[10px]" />
                  New
                </div>
              )}
            </div>
          </div>

          {notification.message && (
            <div className="bg-emerald-50 dark:bg-slate-700/40 rounded-xl p-4">
              <p className="text-sm sm:text-base text-emerald-900 dark:text-slate-100">
                {notification.message}
              </p>
            </div>
          )}

          <div className="space-y-3 border-t border-emerald-100 dark:border-slate-700 pt-4">
            {notification.plantName && (
              <div className="flex items-center gap-3 text-sm">
                <FaLeaf className="text-emerald-600 dark:text-emerald-400" />
                <div>
                  <div className="text-xs text-emerald-700/80 dark:text-slate-400 uppercase tracking-wide">
                    Plant
                  </div>
                  <div className="text-emerald-900 dark:text-slate-100 font-medium">
                    {notification.plantName}
                  </div>
                </div>
              </div>
            )}

            {notification.spaceName && (
              <div className="flex items-center gap-3 text-sm">
                <FaMapMarkerAlt className="text-emerald-600 dark:text-emerald-400" />
                <div>
                  <div className="text-xs text-emerald-700/80 dark:text-slate-400 uppercase tracking-wide">
                    Space
                  </div>
                  <div className="text-emerald-900 dark:text-slate-100 font-medium">
                    {notification.spaceName}
                  </div>
                </div>
              </div>
            )}

            {notification.dueAt && (
              <div className="flex items-center gap-3 text-sm">
                <FaClock className="text-emerald-600 dark:text-emerald-400" />
                <div>
                  <div className="text-xs text-emerald-700/80 dark:text-slate-400 uppercase tracking-wide">
                    Due Date
                  </div>
                  <div className="text-emerald-900 dark:text-slate-100 font-medium">
                    {fmtFullDateTime(notification.dueAt)}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 text-sm">
              <FaClock className="text-emerald-600 dark:text-emerald-400" />
              <div>
                <div className="text-xs text-emerald-700/80 dark:text-slate-400 uppercase tracking-wide">
                  Received
                </div>
                <div className="text-emerald-900 dark:text-slate-100 font-medium">
                  {fmtFullDateTime(notification.createdAt)}
                </div>
              </div>
            </div>

            {notification.taskType && (
              <div className="flex items-center gap-3 text-sm">
                <div>
                  <div className="text-xs text-emerald-700/80 dark:text-slate-400 uppercase tracking-wide">
                    Task Type
                  </div>
                  <div className="text-emerald-900 dark:text-slate-100 font-medium capitalize">
                    {notification.taskType}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t border-emerald-100 dark:border-slate-700">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors text-sm sm:text-base"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
