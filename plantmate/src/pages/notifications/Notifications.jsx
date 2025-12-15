// src/pages/notifications/Notifications.jsx
import React, { useEffect, useState } from "react";
import {
  FaBell,
  FaLeaf,
  FaCalendarAlt,
  FaCheckCircle,
  FaExclamationCircle,
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
                className={`p-3 sm:p-4 flex items-start gap-3 sm:gap-4 ${
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
                        <p className="mt-0.5 text-xs sm:text-sm text-emerald-800/90 dark:text-slate-200/90">
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
    </div>
  );
}
