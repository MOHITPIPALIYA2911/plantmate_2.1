import React, { useEffect, useMemo, useState } from "react";
import { FaSave, FaUndo, FaGlobe, FaBell, FaClock, FaAdjust } from "react-icons/fa";
import api from "../../lib/api";

let notify = (type, msg) => {
  try {
    const { triggerNotification } = require("../../utils/toastUtil");
    triggerNotification(type, msg);
  } catch { alert(msg); }
};

const DEFAULTS = {
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata",
  preferred_units: "metric",
  first_day_of_week: "mon",
  notif: { in_app: true, default_snooze_min: 120 },
  care_defaults: { overdue_snooze_policy: "from_now" },
  theme: { mode: "auto" },
};

const TIMEZONES = ["Asia/Kolkata","UTC","Asia/Dubai","Europe/London","Europe/Berlin","America/New_York","America/Los_Angeles"]
  .map((z) => ({ value: z, label: z }));

const storageKeyForUser = (user) =>
  user && (user.id || user._id) ? `pm_profile_settings_${user.id || user._id}` : "pm_profile_settings";

const loadUser = () => {
  try { return JSON.parse(localStorage.getItem("user") || "null"); } catch { return null; }
};

const readLocal = (user) => {
  const key = storageKeyForUser(user);
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch { return DEFAULTS; }
};

const writeLocal = (user, settings) => {
  const key = storageKeyForUser(user);
  localStorage.setItem(key, JSON.stringify(settings));
};

const syncTheme = (mode) => {
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  const enableDark = mode === "dark" || (mode === "auto" && prefersDark);
  document.documentElement.classList.toggle("dark", !!enableDark);
  localStorage.setItem("pm_theme_mode", mode);
};

// Get current theme from localStorage or system preference
const getCurrentTheme = () => {
  const saved = localStorage.getItem("pm_theme_mode");
  if (saved) return saved;
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
};

export default function Settings() {
  const user = useMemo(loadUser, []);
  const [settings, setSettings] = useState(() => {
    const local = readLocal(user);
    // Preserve current theme state on initial load
    const currentTheme = getCurrentTheme();
    if (!local.theme?.mode || local.theme.mode === "auto") {
      // If no theme set or auto, use current theme state
      local.theme = { mode: currentTheme };
    }
    return local;
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [themeInitialized, setThemeInitialized] = useState(false);

  useEffect(() => {
    const fetcher = async () => {
      try {
        const res = await api.get("/profiles/me");
        if (res?.data?.settings) {
          const merged = { ...DEFAULTS, ...res.data.settings };
          // Preserve current theme if not explicitly set in server settings
          if (!merged.theme?.mode || merged.theme.mode === "auto") {
            const currentTheme = getCurrentTheme();
            merged.theme = { mode: currentTheme };
          }
          setSettings(merged);
          writeLocal(user, merged);
          // Only sync theme if it's explicitly set (not auto)
          if (merged.theme?.mode && merged.theme.mode !== "auto") {
            syncTheme(merged.theme.mode);
          }
        } else {
          writeLocal(user, settings);
        }
      } catch {
        notify("info", "Using local settings.");
        writeLocal(user, settings);
      } finally { setLoading(false); }
    };
    fetcher();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Only sync theme when user explicitly changes it, not on initial load
  useEffect(() => {
    if (themeInitialized) {
      syncTheme(settings.theme?.mode || "auto");
    } else {
      setThemeInitialized(true);
    }
  }, [settings.theme?.mode, themeInitialized]);

  useEffect(() => {
    const mql = window.matchMedia?.("(prefers-color-scheme: dark)");
    const handler = () => { if ((settings.theme?.mode || "auto") === "auto") syncTheme("auto"); };
    mql?.addEventListener?.("change", handler) ?? mql?.addListener?.(handler);
    return () => mql?.removeEventListener?.("change", handler) ?? mql?.removeListener?.(handler);
  }, [settings.theme?.mode]);

  const set = (path, value) => setSettings((prev) => assignAt(prev, path, value));

  const onSave = async () => {
    setSaving(true);
    try {
      const res = await api.put("/profiles/me", { settings });
      const merged = res?.data?.settings ? { ...DEFAULTS, ...res.data.settings } : settings;
      setSettings(merged);
      writeLocal(user, merged);
      notify("success", "Settings saved.");
    } catch (e) {
      notify("error", e?.response?.data?.message || "Failed to save settings.");
    } finally { setSaving(false); }
  };

  const onReset = () => {
    setSettings(DEFAULTS);
    writeLocal(user, DEFAULTS);
    syncTheme(DEFAULTS.theme.mode);
    notify("success", "Settings reset.");
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="h-8 w-40 bg-emerald-100 dark:bg-emerald-900/30 rounded mb-4" />
        <div className="space-y-4">
          <div className="h-24 bg-white dark:bg-slate-800 rounded-2xl border border-emerald-200 dark:border-emerald-800" />
          <div className="h-40 bg-white dark:bg-slate-800 rounded-2xl border border-emerald-200 dark:border-emerald-800" />
          <div className="h-40 bg-white dark:bg-slate-800 rounded-2xl border border-emerald-200 dark:border-emerald-800" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-emerald-900 dark:text-emerald-100">Settings</h1>
          <p className="text-emerald-800/80 dark:text-emerald-200/80">Simple preferences synced to your profile.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onReset} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100 hover:bg-emerald-50 dark:hover:bg-emerald-900/20" disabled={saving}>
            <FaUndo /> Reset
          </button>
          <button onClick={onSave} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60" disabled={saving}>
            <FaSave /> {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      <Section title="Account">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ReadOnly label="Name" value={user?.name || `${user?.first_Name || ""} ${user?.LastName || ""}`.trim()} />
          <ReadOnly label="Email" value={user?.emailId || user?.email || ""} />
        </div>
      </Section>

      <Section title="Appearance" icon={<FaAdjust className="text-white/90" />}>
        <RadioGroup
          label="Theme"
          value={settings.theme?.mode || "auto"}
          onChange={(v) => set("theme.mode", v)}
          options={[
            { value: "light", label: "Light" },
            { value: "dark", label: "Dark" },
            { value: "auto", label: "System (Auto)" },
          ]}
        />
      </Section>

      <Section title="Profile & Locale" icon={<FaGlobe className="text-white/90" />} disabled>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select label="Timezone" value={settings.timezone} onChange={(v) => set("timezone", v)} options={TIMEZONES} disabled />
          <Select label="Units" value={settings.preferred_units} onChange={(v) => set("preferred_units", v)}
            options={[{ value: "metric", label: "Metric (°C, liters)" }, { value: "imperial", label: "Imperial (°F, gallons)" }]} disabled />
          <Select label="First day of week" value={settings.first_day_of_week} onChange={(v) => set("first_day_of_week", v)}
            options={[{ value: "sun", label: "Sunday" }, { value: "mon", label: "Monday" }]} disabled />
        </div>
      </Section>

      <Section title="Notifications" icon={<FaBell className="text-white/90" />} disabled>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Toggle label="Enable in-app notifications" checked={!!settings.notif.in_app} onChange={(v) => set("notif.in_app", v)} disabled />
          <Number label="Default snooze (minutes)" value={settings.notif.default_snooze_min} onChange={(v) => set("notif.default_snooze_min", v)} min="5" step="5" disabled />
          <div className="flex items-end">
            <button onClick={() => notify("info", "Test notification 🔔")} className="w-full px-3 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 opacity-50 cursor-not-allowed" disabled>
              Send test
            </button>
          </div>
        </div>
      </Section>

      <Section title="Care Defaults" icon={<FaClock className="text-white/90" />} disabled>
        <RadioGroup
          label="Overdue snooze policy"
          value={settings.care_defaults.overdue_snooze_policy}
          onChange={(v) => set("care_defaults.overdue_snooze_policy", v)}
          options={[
            { value: "from_now", label: "Always +snooze from now" },
            { value: "keep_today", label: "Keep within today (max 23:59)" },
          ]}
          disabled
        />
      </Section>
    </div>
  );
}

function Section({ title, icon, children, disabled }) {
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-2xl border border-emerald-200 dark:border-emerald-800 shadow-sm overflow-hidden ${disabled ? 'opacity-60' : ''}`}>
      <div className={`px-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-medium flex items-center gap-2 ${disabled ? 'opacity-75' : ''}`}>
        {icon ? icon : null} {title}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function ReadOnly({ label, value }) {
  return (
    <div>
      <label className="block text-sm text-gray-700 dark:text-gray-200 mb-1">{label}</label>
      <div className="w-full rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 px-3 py-2 text-gray-700 dark:text-gray-200">
        {value || "—"}
      </div>
    </div>
  );
}

function Select({ label, value, onChange, options, disabled }) {
  const opts = Array.isArray(options) ? options : Object.entries(options).map(([v,l]) => ({ value: v, label: l }));
  return (
    <div>
      <label className="block text-sm text-gray-700 dark:text-gray-200 mb-1">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}
        className={`w-full rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
        {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function Toggle({ label, checked, onChange, disabled }) {
  return (
    <div>
      <label className="block text-sm text-gray-700 dark:text-gray-200 mb-2">{label}</label>
      <label className={`inline-flex items-center gap-3 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
        <input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)} disabled={disabled} className="h-5 w-5 accent-emerald-600" />
        <span className="text-sm text-gray-800 dark:text-gray-200">{checked ? "On" : "Off"}</span>
      </label>
    </div>
  );
}

function RadioGroup({ label, value, onChange, options, disabled }) {
  return (
    <div>
      <div className="block text-sm text-gray-700 dark:text-gray-200 mb-1">{label}</div>
      <div className={`flex flex-wrap gap-3 ${disabled ? 'opacity-50' : ''}`}>
        {options.map((o) => (
          <label key={o.value} className={`inline-flex items-center gap-2 ${disabled ? 'cursor-not-allowed' : ''}`}>
            <input type="radio" name={label} checked={value === o.value} onChange={() => onChange(o.value)} disabled={disabled} className="h-5 w-5 accent-emerald-600" />
            <span className="text-sm text-gray-800 dark:text-gray-200">{o.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function Number({ label, value, onChange, min, max, step = "1", disabled }) {
  return (
    <div>
      <label className="block text-sm text-gray-700 dark:text-gray-200 mb-1">{label}</label>
      <input
        type="number" value={value ?? ""} onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
        min={min} max={max} step={step} disabled={disabled}
        className={`w-full rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      />
    </div>
  );
}

function assignAt(obj, path, value) {
  const parts = path.split(".");
  const next = { ...obj }; let cur = next;
  for (let i = 0; i < parts.length - 1; i++) { const k = parts[i]; cur[k] = Array.isArray(cur[k]) ? [...cur[k]] : { ...(cur[k] || {}) }; cur = cur[k]; }
  cur[parts[parts.length - 1]] = value; return next;
}
