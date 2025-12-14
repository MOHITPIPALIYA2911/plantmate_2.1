// src/pages/plants/Plants.js
import React, { useEffect, useMemo, useState } from "react";
import {
  FaLeaf,
  FaMapMarkerAlt,
  FaSun,
  FaTint,
  FaFlask,
  FaPlus,
  FaTrash,
  FaSearch,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";
import AddPlantModal from "../../component/plants/AddPlantModal";
import plantBg from "../../assets/plantBg.png"

import {
  LS_SPACES,
  LS_CATALOG,
  LS_USER_PLANTS,
  LS_PLANTS_API_BASE,
  LS_CATALOG_API_BASE,
  CANDIDATE_PLANTS,
  CANDIDATE_CATALOG,
  getId,
  loadLocal,
  saveLocal,
  mapCatalog,
  DEFAULT_PLANTS,
  discoverBase,
} from "../../utils/plantHelpers";



export default function Plants() {
  const navigate = useNavigate();

  const [spaces, setSpaces] = useState(() => loadLocal(LS_SPACES, []));
  const [catalog, setCatalog] = useState(() => loadLocal(LS_CATALOG, []));
  const [myPlants, setMyPlants] = useState(() => loadLocal(LS_USER_PLANTS, []));
  const [query, setQuery] = useState("");
  const [openAdd, setOpenAdd] = useState(false);

  const [plantsBase, setPlantsBase] = useState(() =>
    localStorage.getItem(LS_PLANTS_API_BASE)
  );
  const [catalogBase, setCatalogBase] = useState(() =>
    localStorage.getItem(LS_CATALOG_API_BASE)
  );

  // initial load
  useEffect(() => {
    const boot = async () => {
      // 1) catalog
      try {
        let base = catalogBase;
        if (!base) {
          base = await discoverBase(
            CANDIDATE_CATALOG,
            LS_CATALOG_API_BASE,
            (data) =>
              Array.isArray(data) ||
              Array.isArray(data?.rows) ||
              Array.isArray(data?.plants)
          );
          setCatalogBase(base);
        }
        if (base) {
          const { data } = await api.get(base);
          const rows = Array.isArray(data) ? data : data?.rows || data?.plants || [];
          const mapped = mapCatalog(rows);
          if (mapped.length) {
            setCatalog(mapped);
            saveLocal(LS_CATALOG, mapped);
          }
        } else {
          setCatalog(DEFAULT_PLANTS);
          saveLocal(LS_CATALOG, DEFAULT_PLANTS);
        }
      } catch {
        /* keep cached */
      }

      // 2) user plants
      try {
        let base = plantsBase;
        if (!base) {
          base = await discoverBase(
            CANDIDATE_PLANTS,
            LS_PLANTS_API_BASE,
            (data) =>
              Array.isArray(data) ||
              Array.isArray(data?.rows) ||
              Array.isArray(data?.plants)
          );
          setPlantsBase(base);
        }
        if (base) {
          const { data } = await api.get(base);
          const rows = Array.isArray(data) ? data : data?.rows || data?.plants || [];
          setMyPlants(rows);
          saveLocal(LS_USER_PLANTS, rows);
        }
      } catch {
        /* keep cached */
      }

      // 3) spaces
      if (!spaces?.length) {
        try {
          const spacesEndpoint =
            localStorage.getItem("pm_spaces_api_base") || "/api/spaces";
          const { data } = await api.get(spacesEndpoint);
          const arr = Array.isArray(data) ? data : data?.rows || data?.spaces || [];
          if (arr.length) {
            setSpaces(arr);
            saveLocal(LS_SPACES, arr);
          }
        } catch {
          /* ignore */
        }
      }
    };

    boot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const spaceById = useMemo(() => {
    const m = new Map();
    (spaces || []).forEach((s) => m.set(s.id || s._id, s));
    return m;
  }, [spaces]);

  const plantBySlug = useMemo(() => {
    const m = new Map();
    (catalog || []).forEach((p) => m.set(p.slug, p));
    return m;
  }, [catalog]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return myPlants;
    return myPlants.filter((up) => {
      const cat = plantBySlug.get(up.plant_id || up.plant_slug);
      const nickname = (up.nickname || "").toLowerCase();
      return (
        nickname.includes(q) ||
        cat?.common_name?.toLowerCase().includes(q) ||
        cat?.scientific_name?.toLowerCase().includes(q)
      );
    });
  }, [myPlants, plantBySlug, query]);

  const handleDelete = async (id) => {
    const next = myPlants.filter((p) => getId(p) !== id);
    setMyPlants(next);
    saveLocal(LS_USER_PLANTS, next);
    try {
      const base = plantsBase || localStorage.getItem(LS_PLANTS_API_BASE);
      if (base) await api.delete(`${base}/${id}`);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h1 className="text-xl sm:text-2xl font-semibold text-emerald-900 dark:text-slate-100">
          My Plants
        </h1>
        <div className="flex gap-2 sm:gap-3 flex-wrap w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial min-w-[200px] sm:min-w-0">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-700/80 dark:text-emerald-300/90" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name…"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-emerald-200 dark:border-slate-600 bg-white dark:bg-slate-800 placeholder-emerald-700/70 dark:placeholder-slate-400 text-emerald-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-300 text-sm sm:text-base"
            />
          </div>
          <button
            onClick={() => setOpenAdd(true)}
            className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm sm:text-base w-full sm:w-auto"
          >
            <FaPlus /> Add Plant
          </button>
        </div>
      </div>

      {/* Empty state / list */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-emerald-200 dark:border-slate-700 p-6 bg-white dark:bg-slate-800 text-emerald-800 dark:text-slate-200">
          {myPlants.length === 0 ? (
            <>
              No plants yet. Click <b>Add Plant</b> to start your garden 🌿
            </>
          ) : (
            "No plants match your search."
          )}
        </div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filtered.map((up) => {
            const sp = spaceById.get(up.space_id);
            const cat = plantBySlug.get(up.plant_id || up.plant_slug) || {};
            return (
              <li
                key={getId(up)}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-emerald-200 dark:border-slate-700 shadow-sm overflow-hidden"
              >
                <div className="h-48 w-full">
                  <img
                    src={plantBg}
                    alt="Plant header"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-lg font-semibold text-emerald-900 dark:text-slate-100 flex items-center gap-2">
                        <FaLeaf className="text-emerald-700 dark:text-emerald-300" />
                        {up.nickname || cat.common_name || up.plant_id || up.plant_slug}
                      </div>
                      <div className="text-sm text-emerald-800/80 dark:text-slate-300">
                        {cat.common_name}{" "}
                        <span className="text-emerald-700/60 dark:text-emerald-300/60">•</span>{" "}
                        <i>{cat.scientific_name}</i>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-lg bg-emerald-50 dark:bg-slate-700/40 border border-emerald-200 dark:border-slate-600 text-emerald-800 dark:text-slate-200 capitalize">
                      {up.status || "active"}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <Chip icon={<FaMapMarkerAlt />} label="Space" value={sp?.name || "-"} />
                    <Chip
                      icon={<FaSun />}
                      label="Light"
                      value={sp?.sunlight_hours != null ? `${sp.sunlight_hours}h` : "-"}
                    />
                    <Chip
                      icon={<FaTint />}
                      label="Water"
                      value={(cat.watering_need || "-").toUpperCase()}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <Chip
                      icon={<FaFlask />}
                      label="Fertilize"
                      value={
                        cat.fertilization_freq_days
                          ? `~${cat.fertilization_freq_days}d`
                          : "-"
                      }
                    />
                    <Chip
                      icon={<FaLeaf />}
                      label="Pot"
                      value={
                        cat.pot_size_min_liters
                          ? `${cat.pot_size_min_liters}L+`
                          : "-"
                      }
                    />
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => navigate(`/plants/${getId(up)}`)}
                      className="px-3 py-2 rounded-xl border border-emerald-200 dark:border-slate-600 text-emerald-900 dark:text-slate-100 hover:bg-emerald-50 dark:hover:bg-slate-700 text-sm"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => handleDelete(getId(up))}
                      className="px-3 py-2 rounded-xl border border-red-200 dark:border-red-700 text-red-600 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm inline-flex items-center gap-2"
                    >
                      <FaTrash /> Remove
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {openAdd && (
        <AddPlantModal
          spaces={spaces}
          catalog={catalog}
          plantsBase={plantsBase}
          catalogBase={catalogBase}
          onClose={() => setOpenAdd(false)}
          onAdded={(row) => {
            const next = [row, ...myPlants];
            setMyPlants(next);
            saveLocal(LS_USER_PLANTS, next);
            setOpenAdd(false);
          }}
        />
      )}
    </div>
  );
}

function Chip({ icon, label, value }) {
  return (
    <div className="rounded-xl bg-emerald-50 dark:bg-slate-700/40 border border-emerald-100 dark:border-slate-600 p-2">
      <div className="flex items-center gap-2 text-emerald-800 dark:text-slate-200">
        <span className="text-emerald-700 dark:text-emerald-300">{icon}</span>
        <span className="text-xs uppercase tracking-wide">{label}</span>
      </div>
      <div className="mt-0.5 font-medium text-emerald-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}
