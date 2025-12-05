// src/pages/calendar/Calendar.js
import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  FaChevronLeft, FaChevronRight, FaPlus, FaCalendarAlt,
  FaClock, FaMapMarkerAlt, FaTrash
} from "react-icons/fa";
import api from "../../lib/api";

/* ---------- utils ---------- */
const LS_EVENTS = "pm_calendar_events";
const LS_BASE   = "pm_calendar_api_base";

const startOfMonth = (d) => { const x = new Date(d); x.setDate(1); x.setHours(0,0,0,0); return x; };
const endOfMonth   = (d) => { const x = new Date(d); x.setMonth(x.getMonth()+1,0); x.setHours(23,59,59,999); return x; };
const startOfGrid  = (d) => { const s = startOfMonth(d); const day = s.getDay(); const x = new Date(s); x.setDate(s.getDate()-day); return x; };
const addDays      = (d, n) => { const x = new Date(d); x.setDate(x.getDate()+n); return x; };
const sameYMD      = (a,b) => a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
const fmtDay       = (d) => d.toLocaleDateString([], { weekday:"short", day:"2-digit", month:"short" });
const fmtHM        = (d) => d.toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" });
const monthLabel   = (d) => d.toLocaleDateString([], { month:"long", year:"numeric" });
const getId        = (e) => e?._id || e?.id;
const uid          = () => "ev_" + Math.random().toString(36).slice(2) + Date.now();

const readEvents = () => { try { return JSON.parse(localStorage.getItem(LS_EVENTS) || "[]"); } catch { return []; } };
const writeEvents = (arr) => localStorage.setItem(LS_EVENTS, JSON.stringify(arr));
const normalizeServer = (data) => Array.isArray(data) ? data : (Array.isArray(data?.events) ? data.events : []);

/* ---------- endpoint discovery ---------- */
async function tryGet(path) {
  try { const { data } = await api.get(path); return normalizeServer(data); }
  catch { return null; }
}
async function discoverBase() {
  const candidates = ["/api/calendar", "/api/calendar/events", "/calendar"];
  for (const c of candidates) {
    const res = await tryGet(c);
    if (res) return { base: c, data: res };
  }
  return { base: null, data: null };
}

export default function Calendar() {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selected, setSelected] = useState(() => new Date());
  const [events, setEvents] = useState([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [base, setBase] = useState(() => localStorage.getItem(LS_BASE));
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);

  // load with discovery + graceful fallback
  const load = useCallback(async () => {
    try {
      if (base) {
        const { data } = await api.get(base);
        const arr = normalizeServer(data);
        setEvents(arr); writeEvents(arr);
        return;
      }
      const found = await discoverBase();
      if (found.base) {
        setBase(found.base);
        localStorage.setItem(LS_BASE, found.base);
        setEvents(found.data); writeEvents(found.data);
      } else {
        // backend route not present – use cached data
        setEvents(readEvents());
      }
    } catch {
      setEvents(readEvents());
    }
  }, [base]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const grid = useMemo(() => {
    const start = startOfGrid(month);
    return Array.from({ length: 42 }, (_, i) => addDays(start, i));
  }, [month]);

  const monthStart = startOfMonth(month);
  const monthEnd   = endOfMonth(month);

  const dayEvents = useMemo(
    () => events
      .filter((e) => sameYMD(new Date(e.start), selected))
      .sort((a, b) => new Date(a.start) - new Date(b.start)),
    [events, selected]
  );

  const eventsByDay = useMemo(() => {
    const map = new Map();
    events.forEach((e) => {
      const k = new Date(e.start);
      const key = `${k.getFullYear()}-${k.getMonth()}-${k.getDate()}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(e);
    });
    return map;
  }, [events]);

  const prevMonth = () => setMonth((m) => addDays(startOfMonth(m), -1));
  const nextMonth = () => setMonth((m) => addDays(endOfMonth(m), 1));
  const goToday   = () => { const t = new Date(); setMonth(startOfMonth(t)); setSelected(t); };

  /* ---------- add / delete with optimistic + offline fallback ---------- */
  const addEvent = async (payload) => {
    // optimistic local
    const optimistic = { id: uid(), ...payload };
    setEvents((cur) => { const next = [optimistic, ...cur]; writeEvents(next); return next; });

    try {
      if (!base) {
        const found = await discoverBase();
        if (found.base) {
          setBase(found.base); localStorage.setItem(LS_BASE, found.base);
        }
      }
      if (base || localStorage.getItem(LS_BASE)) {
        const useBase = base || localStorage.getItem(LS_BASE);
        await api.post(useBase, payload);
        await load(); // refresh from server truth
      }
    } catch {
      // remain on local cache
    }
  };

  const removeEvent = async (id) => {
    // optimistic local
    setEvents((cur) => { const next = cur.filter((e) => getId(e) !== id); writeEvents(next); return next; });

    try {
      const useBase = base || localStorage.getItem(LS_BASE);
      if (useBase) await api.delete(`${useBase}/${id}`);
    } catch {
      // ignore; stays removed locally
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button onClick={prevMonth} className="p-2 rounded-full border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20" aria-label="Previous month">
            <FaChevronLeft />
          </button>
          <div className="text-lg sm:text-xl font-semibold text-emerald-900 dark:text-emerald-100">{monthLabel(month)}</div>
          <button onClick={nextMonth} className="p-2 rounded-full border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20" aria-label="Next month">
            <FaChevronRight />
          </button>
          <button onClick={goToday} className="px-3 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-sm">
            Today
          </button>
        </div>
        <button onClick={() => setOpenAdd(true)} className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm sm:text-base">
          <FaPlus /> <span className="hidden sm:inline">Add Event</span><span className="sm:hidden">Add</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-emerald-200 dark:border-emerald-800 shadow-sm overflow-hidden">
        <div className="grid grid-cols-7 text-center bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm font-medium">
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d)=> (<div key={d} className="px-1 sm:px-2 py-2">{d}</div>))}
        </div>

        <div className="grid grid-cols-7">
          {grid.map((d) => {
            const isOther = d < monthStart || d > monthEnd;
            const isSelected = sameYMD(d, selected);
            const isToday = sameYMD(d, new Date());
            const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
            const evs = eventsByDay.get(key) || [];
            return (
              <button
                key={d.toISOString()}
                onClick={() => setSelected(d)}
                className={[
                  "h-20 sm:h-24 md:h-28 p-1 sm:p-2 text-left border border-emerald-100 dark:border-emerald-900 relative",
                  isOther ? "bg-slate-50 dark:bg-slate-900/30 text-slate-400"
                          : "bg-white dark:bg-slate-800 text-emerald-900 dark:text-emerald-100",
                  isSelected ? "ring-2 ring-emerald-400 z-10" : "",
                ].join(" ")}
              >
                <div className="flex items-center justify-between">
                  <span className={[
                      "text-xs sm:text-sm px-1 sm:px-2 py-0.5 rounded-full",
                      isToday ? "bg-emerald-600 text-white"
                              : "text-emerald-900 dark:text-emerald-100 bg-emerald-50 dark:bg-emerald-900/20",
                    ].join(" ")}
                  >
                    {d.getDate()}
                  </span>
                  {evs.length > 0 && <span className="text-[10px] sm:text-xs text-emerald-700 dark:text-emerald-200">{evs.length} •</span>}
                </div>
                <div className="mt-1 sm:mt-2 space-y-0.5 sm:space-y-1">
                  {evs.slice(0, isMobile ? 1 : 3).map((e) => (
                    <div
                      key={getId(e)}
                      className="truncate text-[10px] sm:text-xs px-1 sm:px-2 py-0.5 sm:py-1 rounded bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200 border border-emerald-100 dark:border-emerald-800"
                      title={e.title}
                    >
                      <span className="hidden sm:inline">{new Date(e.start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} • </span>{e.title}
                    </div>
                  ))}
                  {evs.length > (isMobile ? 1 : 3) && <div className="text-[10px] text-emerald-600 dark:text-emerald-300">+{evs.length - (isMobile ? 1 : 3)}</div>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 sm:mt-6 bg-white dark:bg-slate-800 rounded-2xl border border-emerald-200 dark:border-emerald-800 shadow-sm overflow-hidden">
        <div className="px-3 sm:px-4 py-2 sm:py-3 bg-emerald-600 text-white flex items-center gap-2 text-sm sm:text-base">
          <FaCalendarAlt /> {fmtDay(selected)}
        </div>
        <div className="p-3 sm:p-4">
          {dayEvents.length === 0 ? (
            <div className="rounded-xl border border-emerald-100 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-100 px-3 py-4 text-sm">
              No events on this day.
            </div>
          ) : (
            <ul className="space-y-2 sm:space-y-3">
              {dayEvents.map((e) => (
                <li key={getId(e)} className="flex items-start justify-between gap-2 sm:gap-3 rounded-xl border border-emerald-100 dark:border-emerald-800 p-2 sm:p-3">
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="font-semibold text-sm sm:text-base text-emerald-900 dark:text-emerald-100">{e.title}</div>
                    <div className="text-xs sm:text-sm text-emerald-800/90 dark:text-emerald-200/90 flex items-center gap-2">
                      <FaClock />
                      {fmtHM(new Date(e.start))} {e.end ? `– ${fmtHM(new Date(e.end))}` : ""}
                    </div>
                    {e.spaceName ? (
                      <div className="text-xs sm:text-sm text-emerald-800/90 dark:text-emerald-200/90 flex items-center gap-2">
                        <FaMapMarkerAlt /> {e.spaceName}
                      </div>
                    ) : null}
                    {e.note ? <div className="text-xs sm:text-sm text-emerald-800/90 dark:text-emerald-200/90">{e.note}</div> : null}
                  </div>
                  <button
                    onClick={() => removeEvent(getId(e))}
                    className="p-1.5 sm:p-2 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 flex-shrink-0"
                    aria-label="Delete"
                  >
                    <FaTrash className="text-sm sm:text-base" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {openAdd && (
        <AddEventModal
          defaultDate={selected}
          onClose={() => setOpenAdd(false)}
          onSave={addEvent}
        />
      )}
    </div>
  );
}

function AddEventModal({ defaultDate, onClose, onSave }) {
  const [form, setForm] = useState({
    title: "", date: toLocalDateInput(defaultDate), time: "09:00",
    durationMins: 60, spaceName: "", note: "",
  });

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return alert("Title required");
    if (!form.date) return alert("Date required");
    const start = combineLocalDateTime(form.date, form.time || "09:00");
    const end = Number(form.durationMins) > 0
      ? new Date(start.getTime() + Number(form.durationMins) * 60000) : null;
    await onSave({
      title: form.title.trim(),
      start: start.toISOString(),
      end: end ? end.toISOString() : null,
      spaceName: form.spaceName.trim(),
      note: form.note.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden my-4 sm:my-8">
        <div className="px-4 sm:px-5 py-2 sm:py-3 border-b border-gray-200 dark:border-slate-700 bg-emerald-600 text-white font-semibold text-sm sm:text-base">Add Event</div>
        <form onSubmit={submit} className="p-4 sm:p-5 space-y-3 sm:space-y-4">
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-200 mb-1">Title</label>
            <input value={form.title} onChange={(e) => update("title", e.target.value)} className="w-full rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm sm:text-base" placeholder="Watering session" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-200 mb-1">Date</label>
              <input type="date" value={form.date} onChange={(e) => update("date", e.target.value)} className="w-full rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm sm:text-base" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-200 mb-1">Time</label>
              <input type="time" value={form.time} onChange={(e) => update("time", e.target.value)} className="w-full rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm sm:text-base" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-200 mb-1">Duration (mins)</label>
              <input type="number" min={0} step={15} value={form.durationMins} onChange={(e) => update("durationMins", e.target.value)} className="w-full rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm sm:text-base" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-200 mb-1">Space</label>
              <input value={form.spaceName} onChange={(e) => update("spaceName", e.target.value)} className="w-full rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm sm:text-base" placeholder="South Balcony" />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-200 mb-1">Note</label>
            <input value={form.note} onChange={(e) => update("note", e.target.value)} className="w-full rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm sm:text-base" placeholder="Bring watering can" />
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="w-full sm:w-auto px-4 py-2 rounded-xl border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 text-sm sm:text-base">Cancel</button>
            <button type="submit" className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-sm sm:text-base">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function toLocalDateInput(d) {
  const x = new Date(d);
  const y = x.getFullYear();
  const m = String(x.getMonth() + 1).padStart(2, "0");
  const dd = String(x.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}
function combineLocalDateTime(dateStr, timeStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const [hh, mm] = (timeStr || "09:00").split(":").map(Number);
  const x = new Date();
  x.setFullYear(y); x.setMonth(m - 1); x.setDate(d); x.setHours(hh, mm, 0, 0);
  return x;
}
