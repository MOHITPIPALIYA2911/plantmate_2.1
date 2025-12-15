// src/pages/spaces/Spaces.jsx
import React, { useEffect, useState } from "react";
import {
  FaPlus,
  FaCompass,
  FaSun,
  FaMapMarkerAlt,
  FaTrash,
  FaEdit,
} from "react-icons/fa";
import api from "../../lib/api";
import plantAreaTypeImg from "../../assets/plantAreaType.png";

/* ------------------------------ constants ------------------------------ */
const DIRECTIONS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
const DUMMY_SPACES = [
  {
    id: "s1",
    name: "South Balcony",
    type: "balcony",
    direction: "S",
    sunlight_hours: 6,
    area_sq_m: 1.8,
    notes: "",
  },
  {
    id: "s2",
    name: "Kitchen Window",
    type: "windowsill",
    direction: "E",
    sunlight_hours: 3,
    area_sq_m: 0.6,
    notes: "",
  },
];

const LS_SPACES = "spaces";
const LS_SPACES_API_BASE = "pm_spaces_api_base";
const CANDIDATE_ENDPOINTS = ["/api/spaces", "/spaces", "/api/space"];

/* ------------------------------ utilities ------------------------------ */
const getId = (s) => s.id || s._id;

async function discoverSpacesBase() {
  for (const path of CANDIDATE_ENDPOINTS) {
    try {
      const { data } = await api.get(path);
      const arr = Array.isArray(data) ? data : data?.rows || data?.spaces;
      if (Array.isArray(arr)) {
        localStorage.setItem(LS_SPACES_API_BASE, path);
        return path;
      }
    } catch {
      /* try next */
    }
  }
  localStorage.removeItem(LS_SPACES_API_BASE);
  return null;
}

function saveLocal(list) {
  try {
    localStorage.setItem(LS_SPACES, JSON.stringify(list));
  } catch {}
}

function loadLocal() {
  try {
    return JSON.parse(localStorage.getItem(LS_SPACES) || "null");
  } catch {
    return null;
  }
}

/* -------------------------------- page --------------------------------- */
export default function Spaces() {
  const [spaces, setSpaces] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [base, setBase] = useState(() =>
    localStorage.getItem(LS_SPACES_API_BASE)
  );

  useEffect(() => {
    const load = async () => {
      // 1) try API (discover base if needed)
      try {
        let useBase = base;
        if (!useBase) {
          useBase = await discoverSpacesBase();
          setBase(useBase);
        }
        if (useBase) {
          const { data } = await api.get(useBase);
          const arr = Array.isArray(data)
            ? data
            : data?.rows || data?.spaces || [];
          setSpaces(arr);
          saveLocal(arr);
          return;
        }
      } catch {
        /* ignore and fallback */
      }
      // 2) fallback to cache or dummy
      const cached = loadLocal();
      if (cached) {
        setSpaces(cached);
      } else {
        setSpaces(DUMMY_SPACES);
        saveLocal(DUMMY_SPACES);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async (payload) => {
    // optimistic local update
    let next;
    let tempId = null;
    if (editing) {
      next = spaces.map((s) =>
        getId(s) === getId(editing) ? { ...editing, ...payload } : s
      );
    } else {
      tempId = String(Date.now());
      next = [{ id: tempId, ...payload }, ...spaces];
    }
    setSpaces(next);
    saveLocal(next);
    setEditing(null);
    setOpen(false);

    // best-effort API call (won't crash UI on failure)
    try {
      const useBase = base || localStorage.getItem(LS_SPACES_API_BASE);
      if (!useBase) return;

      if (editing) {
        const id = getId(editing);
        const { data } = await api.put(`${useBase}/${id}`, payload);
        const serverRow = data?.space || data;
        if (serverRow && getId(serverRow)) {
          // replace local item with server item (to capture _id)
          const fixed = next.map((s) =>
            getId(s) === id ? serverRow : s
          );
          setSpaces(fixed);
          saveLocal(fixed);
        }
      } else {
        const { data } = await api.post(useBase, payload);
        const serverRow = data?.space || data;
        if (serverRow && getId(serverRow)) {
          // replace temp row with server row - filter out the temporary space by its ID
          const fixed = [
            serverRow,
            ...next.filter((s) => getId(s) !== tempId),
          ];
          setSpaces(fixed);
          saveLocal(fixed);
        }
      }
    } catch {
      /* keep optimistic local state */
    }
  };

  const handleDelete = async (id) => {
    const next = spaces.filter((s) => getId(s) !== id);
    setSpaces(next);
    saveLocal(next);
    try {
      const useBase = base || localStorage.getItem(LS_SPACES_API_BASE);
      if (useBase) await api.delete(`${useBase}/${id}`);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="p-4 sm:p-6">
      {/* header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
        <h1 className="text-xl sm:text-2xl font-semibold text-emerald-900 dark:text-slate-100">
          Your Spaces
        </h1>
        <button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm sm:text-base w-full sm:w-auto justify-center"
        >
          <FaPlus /> Add Space
        </button>
      </div>

      {/* grid */}
      {spaces.length === 0 ? (
        <div className="rounded-2xl border border-emerald-200 dark:border-slate-700 p-6 bg-white dark:bg-slate-800 text-emerald-800 dark:text-slate-200">
          No spaces yet. Click <b>Add Space</b> to begin.
        </div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {spaces.map((s) => (
            <li
              key={getId(s)}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-emerald-200 dark:border-slate-700 shadow-sm overflow-hidden"
            >
              {/* Header image instead of green bar */}
              <div className="relative h-48 w-full overflow-hidden">
                <img
                  src={plantAreaTypeImg}
                  alt="Plant area type"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-emerald-900/10 dark:bg-black/20" />
              </div>

              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-lg font-semibold text-emerald-900 dark:text-slate-100">
                      {s.name}
                    </div>
                    <div className="text-xs uppercase tracking-wide text-emerald-700/80 dark:text-emerald-300/80">
                      {s.type}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditing(s);
                        setOpen(true);
                      }}
                      className="p-2 rounded-lg border border-emerald-200 dark:border-slate-600 text-emerald-800 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-700"
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(getId(s))}
                      className="p-2 rounded-lg border border-red-200 dark:border-red-700 text-red-600 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-sm">
                  <Pill
                    icon={<FaMapMarkerAlt />}
                    label="Area"
                    value={`${s.area_sq_m} m²`}
                  />
                  <Pill
                    icon={<FaCompass />}
                    label="Dir"
                    value={s.direction}
                  />
                  <Pill
                    icon={<FaSun />}
                    label="Sun"
                    value={`${s.sunlight_hours}h`}
                  />
                </div>

                {s.notes ? (
                  <p className="text-sm text-emerald-800/80 dark:text-slate-300">
                    {s.notes}
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}

      {open && (
        <SpaceModal
          initial={
            editing || {
              name: "",
              type: "balcony",
              direction: "S",
              sunlight_hours: 4,
              area_sq_m: 1,
              notes: "",
              location: { lat: "", lng: "" },
            }
          }
          onClose={() => {
            setOpen(false);
            setEditing(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

/* --------------------------- presentation bits -------------------------- */
function Pill({ icon, label, value }) {
  return (
    <div className="rounded-xl bg-emerald-50 dark:bg-slate-700/40 border border-emerald-100 dark:border-slate-600 p-2">
      <div className="flex items-center gap-2 text-emerald-800 dark:text-slate-200">
        <span className="text-emerald-700 dark:text-emerald-300">
          {icon}
        </span>
        <span className="text-xs uppercase tracking-wide">{label}</span>
      </div>
      <div className="mt-0.5 font-medium text-emerald-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}

function SpaceModal({ initial, onClose, onSave }) {
  const [form, setForm] = useState(() => ({
    ...initial,
    location: initial.location || { lat: "", lng: "" },
  }));

  useEffect(() => {
    setForm({
      ...initial,
      location: initial.location || { lat: "", lng: "" },
    });
  }, [initial]);

  const update = (k, v) =>
    setForm((prev) => ({
      ...prev,
      [k]: v,
    }));

  const updateLocation = (k, v) =>
    setForm((prev) => ({
      ...prev,
      location: {
        ...(prev.location || {}),
        [k]: v,
      },
    }));

  const submit = (e) => {
    e.preventDefault();
    // minimal validation
    if (!form.name?.trim()) return alert("Name is required");
    if (!DIRECTIONS.includes(form.direction))
      return alert("Direction invalid");
    if (form.sunlight_hours < 0 || form.sunlight_hours > 12)
      return alert("Sunlight must be 0–12");
    if (form.area_sq_m <= 0) return alert("Area must be > 0");

    const hasLatLng =
      form.location &&
      form.location.lat !== "" &&
      form.location.lng !== "";

    // normalize numeric fields
    const payload = {
      name: form.name.trim(),
      type: form.type,
      direction: form.direction,
      sunlight_hours: Number(form.sunlight_hours),
      area_sq_m: Number(form.area_sq_m),
      notes: form.notes?.trim() || "",
      ...(hasLatLng && {
        location: {
          lat: Number(form.location.lat),
          lng: Number(form.location.lng),
        },
      }),
    };
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden my-4 sm:my-8">
        <div className="px-4 sm:px-5 py-2 sm:py-3 border-b border-gray-200 dark:border-slate-700 bg-emerald-600 text-white font-semibold text-sm sm:text-base">
          {initial.id || initial._id ? "Edit Space" : "Add Space"}
        </div>
        <form
          onSubmit={submit}
          className="p-4 sm:p-5 space-y-3 sm:space-y-4"
        >
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-200 mb-1">
              Name
            </label>
            <input
              className="w-full rounded-xl border border-gray-300 dark:border-slate-600 px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-300 text-sm sm:text-base"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="South Balcony"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-200 mb-1">
                Type
              </label>
              <select
                className="w-full rounded-xl border border-gray-300 dark:border-slate-600 px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                value={form.type}
                onChange={(e) => update("type", e.target.value)}
              >
                <option value="balcony">Balcony</option>
                <option value="windowsill">Windowsill</option>
                <option value="terrace">Terrace</option>
                <option value="indoor">Indoor</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-200 mb-1">
                Direction
              </label>
              <select
                className="w-full rounded-xl border border-gray-300 dark:border-slate-600 px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                value={form.direction}
                onChange={(e) => update("direction", e.target.value)}
              >
                {DIRECTIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-200 mb-1">
                Sunlight (hours/day)
              </label>
              <input
                type="number"
                min={0}
                max={12}
                className="w-full rounded-xl border border-gray-300 dark:border-slate-600 px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm sm:text-base"
                value={form.sunlight_hours}
                onChange={(e) =>
                  update("sunlight_hours", Number(e.target.value))
                }
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-200 mb-1">
                Area (m²)
              </label>
              <input
                type="number"
                step="0.1"
                min={0.1}
                className="w-full rounded-xl border border-gray-300 dark:border-slate-600 px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm sm:text-base"
                value={form.area_sq_m}
                onChange={(e) =>
                  update("area_sq_m", Number(e.target.value))
                }
              />
            </div>
          </div>

          {/* 🌍 Location block */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm text-gray-700 dark:text-gray-200">
                Location (optional)
              </label>
              <button
                type="button"
                onClick={() => {
                  if (!navigator.geolocation) {
                    return alert(
                      "Geolocation not supported in this browser."
                    );
                  }
                  navigator.geolocation.getCurrentPosition(
                    (pos) => {
                      updateLocation("lat", pos.coords.latitude);
                      updateLocation("lng", pos.coords.longitude);
                    },
                    (err) => {
                      console.error(err);
                      alert("Could not get your location.");
                    }
                  );
                }}
                className="text-xs px-2 py-1 rounded-lg border border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-500 dark:text-emerald-200 dark:hover:bg-slate-700"
              >
                Use my location
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">
                  Latitude
                </label>
                <input
                  type="number"
                  step="0.0001"
                  className="w-full rounded-xl border border-gray-300 dark:border-slate-600 px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                  value={form.location?.lat ?? ""}
                  onChange={(e) =>
                    updateLocation("lat", e.target.value)
                  }
                  placeholder="e.g. 23.0225"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">
                  Longitude
                </label>
                <input
                  type="number"
                  step="0.0001"
                  className="w-full rounded-xl border border-gray-300 dark:border-slate-600 px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                  value={form.location?.lng ?? ""}
                  onChange={(e) =>
                    updateLocation("lng", e.target.value)
                  }
                  placeholder="e.g. 72.5714"
                />
              </div>
            </div>

            {form.location?.lat && form.location?.lng && (
              <div className="mt-2">
                <div className="text-[11px] text-gray-500 dark:text-gray-400 mb-1">
                  Approximate map preview
                </div>
                <iframe
                  title="space-location-map"
                  className="w-full h-40 rounded-xl border border-gray-300 dark:border-slate-600"
                  src={`https://www.openstreetmap.org/export/embed.html?layer=mapnik&marker=${form.location.lat},${form.location.lng}`}
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-200 mb-1">
              Notes (optional)
            </label>
            <textarea
              className="w-full rounded-xl border border-gray-300 dark:border-slate-600 px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              rows={3}
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              placeholder="Windy in monsoon; partial shade after 2 PM."
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 rounded-xl border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-sm sm:text-base"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
