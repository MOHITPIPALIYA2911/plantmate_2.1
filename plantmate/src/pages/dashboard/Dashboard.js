// src/pages/dashboard/Dashboard.js
import React, { useEffect, useState } from "react";
import { FaTint, FaMapMarkerAlt, FaSun, FaClock, FaCheckCircle, FaLeaf } from "react-icons/fa";
import api from "../../lib/api";

/* header art */
const LIGHT_SVG = `
<svg xmlns='http://www.w3.org/2000/svg' width='600' height='300' viewBox='0 0 600 300'>
  <defs>
    <linearGradient id='g' x1='0' y1='0' x2='0' y2='1'>
      <stop offset='0%' stop-color='#A7F3D0'/>
      <stop offset='100%' stop-color='#6EE7B7'/>
    </linearGradient>
  </defs>
  <rect width='600' height='300' fill='url(#g)'/>
  <g opacity='0.25'>
    <circle cx='500' cy='70' r='50' fill='#FDE68A'/>
  </g>
</svg>`;
const LIGHT_IMG = "data:image/svg+xml;utf8," + encodeURIComponent(LIGHT_SVG);

const fmtTime = (iso) => new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const InfoPill = ({ icon, label, value }) => (
  <div className="rounded-xl bg-emerald-50 dark:bg-slate-700/60 border border-emerald-100 dark:border-slate-600 p-2">
    <div className="flex items-center gap-2 text-emerald-800 dark:text-slate-200">
      <span className="text-emerald-700 dark:text-emerald-300">{icon}</span>
      <span className="text-xs uppercase tracking-wide">{label}</span>
    </div>
    <div className="mt-0.5 text-emerald-900 dark:text-slate-100 font-medium">{value}</div>
  </div>
);

const Card = ({ plantName, spaceName, sunlightHours, dueAt, note, onDone, onSnooze }) => (
  <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-white dark:bg-slate-800 dark:border-slate-700 shadow-sm">
    <div className="h-28 w-full overflow-hidden">
      <img src={LIGHT_IMG} alt="Plant light" className="w-full h-full object-cover" loading="lazy" />
    </div>
    <div className="p-4 space-y-3">
      <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200 text-xs font-medium px-2.5 py-1">
        <FaTint className="text-emerald-700 dark:text-emerald-300" /> Water task
      </div>
      <div>
        <h3 className="text-lg font-semibold text-emerald-900 dark:text-slate-100 flex items-center gap-2">
          <FaLeaf className="text-emerald-700 dark:text-emerald-300" /> {plantName}
        </h3>
        <p className="text-sm text-emerald-800/80 dark:text-slate-300 mt-0.5">{note}</p>
      </div>
      <div className="grid grid-cols-3 gap-3 text-sm">
        <InfoPill icon={<FaMapMarkerAlt />} label="Space" value={spaceName} />
        <InfoPill icon={<FaSun />} label="Light" value={`${sunlightHours}h`} />
        <InfoPill icon={<FaClock />} label="Due" value={fmtTime(dueAt)} />
      </div>
      <div className="flex gap-2 pt-1">
        <button onClick={onDone} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-sm">
          <FaCheckCircle /> Mark done
        </button>
        <button onClick={onSnooze} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-emerald-200 dark:border-slate-600 text-emerald-900 dark:text-slate-100 hover:bg-emerald-50 dark:hover:bg-slate-700 text-sm">
          Snooze 2h
        </button>
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const [waterTasks, setWaterTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/api/dashboard/water-tasks");
        setWaterTasks(Array.isArray(data?.waterTasks) ? data.waterTasks : []);
      } catch (err) {
        // If it's a 401, the interceptor will handle redirect
        // For other errors, just show empty state
        if (err?.response?.status !== 401) {
          setWaterTasks([]);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleDone = (id) => setWaterTasks((p) => p.filter((t) => t.id !== id));
  const handleSnooze = (id, minutes = 120) =>
    setWaterTasks((p) =>
      p.map((t) => (t.id === id ? { ...t, dueAt: new Date(Date.now() + minutes * 60000).toISOString() } : t))
    );

  if (loading) return <div className="p-6 text-xl">Loading Dashboard...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-emerald-900 dark:text-slate-100 mb-4">Today’s Watering</h1>
      {waterTasks.length === 0 ? (
        <div className="rounded-2xl border border-emerald-200 dark:border-slate-700 p-6 text-emerald-800 dark:text-slate-200 bg-white dark:bg-slate-800">
          All caught up! 🌿
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {waterTasks.map((t) => (
            <Card key={t.id} {...t} onDone={() => handleDone(t.id)} onSnooze={() => handleSnooze(t.id)} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
