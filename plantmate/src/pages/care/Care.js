// src/pages/care/Care.js
import React, { useEffect, useMemo, useState } from "react";
import {
  FaTint,
  FaFlask,
  FaMapMarkerAlt,
  FaSun,
  FaClock,
  FaCheckCircle,
  FaPause,
  FaPlus,
  FaTrash,
} from "react-icons/fa";
import api from "../../lib/api";

/* ----------------------------- local helpers ----------------------------- */
const STORAGE_KEY = "pm_care_tasks_user";
const LS_CARE_BASE = "pm_care_api_base";
const CANDIDATE_ENDPOINTS = ["/api/care/tasks", "/api/care", "/api/tasks", "/care/tasks"];

const fmtTime = (iso) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString([], { day: "2-digit", month: "short" });
const relTime = (iso) => {
  const d = new Date(iso).getTime() - Date.now();
  const mins = Math.round(Math.abs(d) / 60000);
  if (mins < 60) return d < 0 ? `${mins}m ago` : `in ${mins}m`;
  const hrs = Math.round(mins / 60);
  return d < 0 ? `${hrs}h ago` : `in ${hrs}h`;
};
const startOfToday = () => {
  const s = new Date();
  s.setHours(0, 0, 0, 0);
  return s;
};
const endOfToday = () => {
  const e = new Date();
  e.setHours(23, 59, 59, 999);
  return e;
};
const addDays = (d, days) => {
  const n = new Date(d);
  n.setDate(n.getDate() + days);
  return n;
};
const nextRecurringDate = (fromIso, days) => {
  let n = addDays(new Date(fromIso), days);
  const now = new Date();
  while (n <= now) n = addDays(n, days);
  return n;
};
const readTasks = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
};
const writeTasks = (arr) => localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
const uid = () => "ct_" + Math.random().toString(36).slice(2) + Date.now();

/** Try a few endpoints; store the first working one in localStorage. */
async function discoverCareBase() {
  for (const path of CANDIDATE_ENDPOINTS) {
    try {
      const { data } = await api.get(path);
      // accept either an array of tasks or an object with tasks/rows
      const arr = Array.isArray(data) ? data : data?.tasks || data?.rows;
      if (Array.isArray(arr)) {
        localStorage.setItem(LS_CARE_BASE, path);
        return path;
      }
    } catch {
      // ignore and continue
    }
  }
  localStorage.removeItem(LS_CARE_BASE);
  return null;
}

/* --------------------------------- page ---------------------------------- */
export default function Care() {
  const [tasks, setTasks] = useState([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [spaceFilter, setSpaceFilter] = useState("all");
  const [base, setBase] = useState(() => localStorage.getItem(LS_CARE_BASE));

  // initial load: try API then fallback to local
  useEffect(() => {
    const load = async () => {
      try {
        let useBase = base;
        if (!useBase) {
          useBase = await discoverCareBase();
          setBase(useBase);
        }
        if (useBase) {
          const { data } = await api.get(useBase);
          const arr = Array.isArray(data) ? data : data?.tasks || data?.rows || [];
          setTasks(arr);
          writeTasks(arr);
          return;
        }
      } catch {
        /* ignore and fallback */
      }
      // fallback
      setTasks(readTasks());
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const spaces = useMemo(() => {
    const s = Array.from(new Set(tasks.map((t) => (t.spaceName || "").trim()).filter(Boolean)));
    s.sort((a, b) => a.localeCompare(b));
    return s;
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    if (spaceFilter === "all") return tasks;
    return tasks.filter((t) => t.spaceName === spaceFilter);
  }, [tasks, spaceFilter]);

  const { overdue, today, upcoming } = useMemo(() => {
    const o = [],
      t = [],
      u = [];
    const nowStart = startOfToday();
    const nowEnd = endOfToday();
    [...filteredTasks]
      .sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt))
      .forEach((x) => {
        const d = new Date(x.dueAt);
        if (d < nowStart) o.push(x);
        else if (d > nowEnd) u.push(x);
        else t.push(x);
      });
    return { overdue: o, today: t, upcoming: u };
  }, [filteredTasks]);

  const persist = (next) => {
    setTasks(next);
    writeTasks(next);
  };

  const getId = (t) => t.id || t._id;

  const markDone = async (id) => {
    const current = tasks.find((t) => getId(t) === id);
    if (!current) return;

    if (Number(current.recurrenceDays) > 0) {
      const newDue = nextRecurringDate(current.dueAt, Number(current.recurrenceDays));
      const nextTask = { ...current, id: uid(), dueAt: newDue.toISOString() };
      const next = tasks.filter((t) => getId(t) !== id);
      persist([nextTask, ...next]);
    } else {
      persist(tasks.filter((t) => getId(t) !== id));
    }

    try {
      const useBase = base || localStorage.getItem(LS_CARE_BASE);
      if (useBase) {
        // best-effort; ignore errors
        await api.post(`${useBase}/done`, { id });
      }
    } catch {}
  };

  const deleteTask = async (id) => {
    persist(tasks.filter((t) => getId(t) !== id));
    try {
      const useBase = base || localStorage.getItem(LS_CARE_BASE);
      if (useBase) await api.delete(`${useBase}/${id}`);
    } catch {}
  };

  const snoozeTask = async (id, mins = 120) => {
    const next = tasks.map((t) =>
      getId(t) === id ? { ...t, dueAt: new Date(Date.now() + mins * 60000).toISOString() } : t
    );
    persist(next);
    try {
      const useBase = base || localStorage.getItem(LS_CARE_BASE);
      if (useBase) await api.post(`${useBase}/${id}/snooze`, { minutes: mins });
    } catch {}
  };

  const bringToToday = async (id) => {
    const now = new Date();
    const nextHour = new Date(now);
    nextHour.setMinutes(0, 0, 0);
    nextHour.setHours(now.getHours() + 1);
    const target = nextHour > endOfToday() ? endOfToday() : nextHour;

    persist(
      tasks.map((t) => (getId(t) === id ? { ...t, dueAt: target.toISOString() } : t))
    );

    try {
      const useBase = base || localStorage.getItem(LS_CARE_BASE);
      if (useBase) await api.post(`${useBase}/reschedule`, { id, dueAt: target.toISOString() });
    } catch {}
  };

  const addTask = async (task) => {
    const temp = { ...task, id: uid() };
    const next = [temp, ...tasks];
    persist(next);

    try {
      const useBase = base || localStorage.getItem(LS_CARE_BASE);
      if (useBase) {
        const { data } = await api.post(useBase, task);
        const serverTask = (data && (data.task || data)) || null;
        if (serverTask) {
          // replace temp with server version (handles _id)
          persist([serverTask, ...next.filter((t) => getId(t) !== temp.id)]);
        }
      }
    } catch {
      // keep local temp entry
    }
  };

  /* --------------------------------- UI ---------------------------------- */
  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-emerald-900 dark:text-slate-100">Care Tasks</h1>
          <p className="text-sm sm:text-base text-emerald-800/80 dark:text-slate-300">Board view: Overdue, Today, Upcoming</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <select
            value={spaceFilter}
            onChange={(e) => setSpaceFilter(e.target.value)}
            className="rounded-xl border border-emerald-200 dark:border-slate-600 px-3 py-2 text-emerald-900 dark:text-slate-100 bg-white dark:bg-slate-800 text-sm sm:text-base"
          >
            <option value="all">All spaces</option>
            {spaces.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button
            onClick={() => setOpenAdd(true)}
            className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm sm:text-base"
          >
            <FaPlus /> Add Task
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <Column title="Overdue" count={overdue.length} header="from-rose-600 to-rose-500">
          {overdue.length === 0 ? (
            <Empty text="No overdue tasks. Nice work! 🌿" />
          ) : (
            overdue.map((t) => (
              <TaskRow
                key={getId(t)}
                task={t}
                dueLabel="Was due"
                onDone={() => markDone(getId(t))}
                onSnooze={() => snoozeTask(getId(t))}
              />
            ))
          )}
        </Column>

        <Column title="Today" count={today.length} header="from-emerald-600 to-emerald-500">
          {today.length === 0 ? (
            <Empty text="All caught up for today!" />
          ) : (
            today.map((t) => (
              <TaskRow
                key={getId(t)}
                task={t}
                dueLabel="Due"
                onDone={() => markDone(getId(t))}
                onSnooze={() => snoozeTask(getId(t))}
              />
            ))
          )}
        </Column>

        <Column title="Upcoming" count={upcoming.length} header="from-teal-600 to-teal-500">
          {upcoming.length === 0 ? (
            <Empty text="Nothing upcoming yet." />
          ) : (
            upcoming.map((t) => (
              <TaskRow
                key={getId(t)}
                task={t}
                dueLabel="Due"
                onDelete={() => deleteTask(getId(t))}
                onBringToday={() => bringToToday(getId(t))}
              />
            ))
          )}
        </Column>
      </div>

      {openAdd && (
        <AddModal
          onClose={() => setOpenAdd(false)}
          onSave={(payload) => {
            addTask(payload);
            setOpenAdd(false);
          }}
        />
      )}
    </div>
  );
}

/* --------------------------- presentation bits --------------------------- */
function Column({ title, count, header, children }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-emerald-200 dark:border-slate-700 shadow-sm overflow-hidden">
      <div className={`px-4 py-3 bg-gradient-to-r ${header} text-white font-medium`}>
        {title}
        <span className="ml-2 text-xs bg-white/20 rounded-full px-2 py-0.5">{count}</span>
      </div>
      <div className="p-3 space-y-3">{children}</div>
    </div>
  );
}

function Empty({ text }) {
  return (
    <div className="rounded-xl border border-emerald-100 dark:border-slate-700 bg-emerald-50 dark:bg-slate-700/40 text-emerald-800 dark:text-slate-200 px-3 py-4 text-sm">
      {text}
    </div>
  );
}

function TaskRow({ task, dueLabel, onDone, onSnooze, onBringToday, onDelete }) {
  const accent = task.type === "water" ? "bg-emerald-500" : "bg-emerald-700";
  return (
    <div className="flex items-stretch rounded-xl border border-emerald-100 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800">
      <div className={`w-1 ${accent}`} />
      <div className="flex-1 p-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-emerald-900 dark:text-slate-100 font-semibold flex items-center gap-2">
              {task.type === "water" ? (
                <FaTint className="text-emerald-700 dark:text-emerald-300" />
              ) : (
                <FaFlask className="text-emerald-700 dark:text-emerald-300" />
              )}
              {task.plantName}
            </div>
            <div className="text-xs text-emerald-800/80 dark:text-slate-300 mt-0.5">{task.note}</div>
          </div>
          <span className="text-xs px-2 py-1 rounded-lg bg-emerald-50 dark:bg-slate-700/40 border border-emerald-200 dark:border-slate-600 text-emerald-800 dark:text-slate-100 capitalize">
            {task.type === "water" ? "Water" : "Fertilize"}
          </span>
        </div>

        <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
          <Chip icon={<FaMapMarkerAlt />} label="Space" value={task.spaceName} />
          <Chip icon={<FaSun />} label="Light" value={`${task.sunlightHours || 0}h`} />
          <Chip
            icon={<FaClock />}
            label={dueLabel}
            value={`${fmtDate(task.dueAt)} • ${fmtTime(task.dueAt)} (${relTime(task.dueAt)})`}
          />
        </div>

        <div className="mt-2 flex gap-2">
          {typeof onDone === "function" && (
            <button
              onClick={onDone}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-xs"
            >
              <FaCheckCircle /> Done
            </button>
          )}
          {typeof onSnooze === "function" && (
            <button
              onClick={onSnooze}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-slate-600 text-emerald-900 dark:text-slate-100 hover:bg-emerald-50 dark:hover:bg-slate-700 text-xs"
            >
              <FaPause /> Snooze 2h
            </button>
          )}
          {typeof onBringToday === "function" && (
            <button
              onClick={onBringToday}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-slate-600 text-emerald-900 dark:text-slate-100 hover:bg-emerald-50 dark:hover:bg-slate-700 text-xs"
            >
              Bring to Today
            </button>
          )}
          {typeof onDelete === "function" && (
            <button
              onClick={onDelete}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs"
            >
              <FaTrash /> Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Chip({ icon, label, value }) {
  return (
    <div className="rounded-lg bg-emerald-50 dark:bg-slate-700/40 border border-emerald-100 dark:border-slate-600 p-2">
      <div className="flex items-center gap-1.5 text-emerald-800 dark:text-slate-200">
        <span className="text-emerald-700 dark:text-emerald-300">{icon}</span>
        <span className="text-[10px] uppercase tracking-wide">{label}</span>
      </div>
      <div className="mt-0.5 font-medium text-emerald-900 dark:text-slate-100 text-sm leading-tight">{value}</div>
    </div>
  );
}

/* ------------------------------- Add Modal ------------------------------- */
function AddModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    type: "water",
    plantName: "",
    spaceName: "",
    sunlightHours: 0,
    dueAt: "",
    note: "",
    repeat: false,
    recurrenceDays: 0,
  });

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    if (!form.plantName.trim()) return alert("Plant name required");
    if (!form.spaceName.trim()) return alert("Space required");
    if (!form.dueAt) return alert("Due date/time required");
    const payload = {
      type: form.type,
      plantName: form.plantName.trim(),
      spaceName: form.spaceName.trim(),
      sunlightHours: Number(form.sunlightHours) || 0,
      dueAt: new Date(form.dueAt).toISOString(),
      note: form.note,
      recurrenceDays: form.repeat ? Math.max(1, Number(form.recurrenceDays) || 0) : 0,
    };
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden my-4 sm:my-8">
        <div className="px-4 sm:px-5 py-2 sm:py-3 border-b border-gray-200 dark:border-slate-700 bg-emerald-600 text-white font-semibold text-sm sm:text-base">
          Add Care Task
        </div>
        <form onSubmit={submit} className="p-4 sm:p-5 space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-200 mb-1">Type</label>
              <select
                value={form.type}
                onChange={(e) => update("type", e.target.value)}
                className="w-full rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm sm:text-base"
              >
                <option value="water">Water</option>
                <option value="fertilize">Fertilize</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-200 mb-1">Due (date & time)</label>
              <input
                type="datetime-local"
                value={form.dueAt}
                onChange={(e) => update("dueAt", e.target.value)}
                className="w-full rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm sm:text-base"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-200 mb-1">Plant name</label>
              <input
                value={form.plantName}
                onChange={(e) => update("plantName", e.target.value)}
                className="w-full rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm sm:text-base"
                placeholder="Basil"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-200 mb-1">Space name</label>
              <input
                value={form.spaceName}
                onChange={(e) => update("spaceName", e.target.value)}
                className="w-full rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm sm:text-base"
                placeholder="South Balcony"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-200 mb-1">Sunlight (h/day)</label>
              <input
                type="number"
                min={0}
                max={12}
                value={form.sunlightHours}
                onChange={(e) => update("sunlightHours", e.target.value)}
                className="w-full rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm sm:text-base"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-200 mb-1">Note</label>
              <input
                value={form.note}
                onChange={(e) => update("note", e.target.value)}
                className="w-full rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm sm:text-base"
                placeholder="Keep soil moist..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
            <div className="flex items-center gap-2">
              <input
                id="repeat"
                type="checkbox"
                checked={form.repeat}
                onChange={(e) => update("repeat", e.target.checked)}
                className="h-5 w-5 accent-emerald-600"
              />
              <label htmlFor="repeat" className="text-sm text-gray-700 dark:text-gray-200">
                Repeat every
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                value={form.recurrenceDays}
                onChange={(e) => update("recurrenceDays", e.target.value)}
                disabled={!form.repeat}
                className="w-full sm:w-24 rounded-xl border border-gray-300 dark:border-slate-600 px-3 py-2 disabled:bg-gray-100 dark:disabled:bg-slate-700/40 text-sm sm:text-base"
              />
              <span className="text-sm text-gray-700 dark:text-gray-200">day(s)</span>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 rounded-xl border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 text-sm sm:text-base"
            >
              Cancel
            </button>
            <button type="submit" className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-sm sm:text-base">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
