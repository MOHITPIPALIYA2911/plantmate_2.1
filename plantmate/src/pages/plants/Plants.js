// src/pages/plants/Plants.js
// My Plants: list + add plant modal (API with graceful fallback)

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
  FaRobot,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";

/* ---------- tiny SVG header image ---------- */
const LIGHT_SVG = `
<svg xmlns='http://www.w3.org/2000/svg' width='600' height='240' viewBox='0 0 600 240'>
  <defs>
    <linearGradient id='g' x1='0' y1='0' x2='0' y2='1'>
      <stop offset='0%' stop-color='#A7F3D0'/>
      <stop offset='100%' stop-color='#6EE7B7'/>
    </linearGradient>
  </defs>
  <rect width='600' height='240' fill='url(#g)'/>
  <g opacity='0.25'>
    <circle cx='480' cy='60' r='42' fill='#FDE68A'/>
  </g>
  <g>
    <path d='M140 190c26-52 65-52 91 0c-26-13-65-13-91 0z' fill='#059669'/>
    <rect x='166' y='135' width='16' height='52' rx='8' fill='#047857'/>
    <path d='M174 130c18-31 48-35 66-9c-22-4-44 5-66 18z' fill='#10B981'/>
  </g>
</svg>`;
const LIGHT_IMG = "data:image/svg+xml;utf8," + encodeURIComponent(LIGHT_SVG);

/* ---------- storage keys & endpoint candidates ---------- */
const LS_USER = "user";
const LS_SPACES = "spaces";
const LS_USER_PLANTS = "pm_user_plants";
const LS_CATALOG = "pm_catalog_plants";
const LS_PLANTS_API_BASE = "pm_user_plants_api_base";
const LS_CATALOG_API_BASE = "pm_catalog_api_base";

const CANDIDATE_PLANTS = ["/api/user-plants", "/api/plants/user", "/api/plants/my"];
const CANDIDATE_CATALOG = ["/api/catalog/plants", "/api/plants/catalog", "/api/plants"];

/* ---------- helpers ---------- */
const getId = (row) => row?.id || row?._id;
const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem(LS_USER) || "null");
  } catch {
    return null;
  }
};

function loadLocal(key, fallback = null) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}
function saveLocal(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {}
}

async function discoverBase(candidates, saveKey, parseFn) {
  for (const path of candidates) {
    try {
      const { data } = await api.get(path);
      const ok = parseFn?.(data);
      if (ok) {
        localStorage.setItem(saveKey, path);
        return path;
      }
    } catch {
      /* try next */
    }
  }
  localStorage.removeItem(saveKey);
  return null;
}

/* Default plant catalog if API doesn't provide one */
const DEFAULT_PLANTS = [
  {
    slug: "basil",
    common_name: "Basil",
    scientific_name: "Ocimum basilicum",
    min_sun_hours: 5,
    max_sun_hours: 8,
    indoor_ok: true,
    watering_need: "med",
    fertilization_freq_days: 21,
    pot_size_min_liters: 3,
    difficulty: "easy",
    tags: ["herb", "culinary", "fragrant"],
  },
  {
    slug: "mint",
    common_name: "Mint",
    scientific_name: "Mentha",
    min_sun_hours: 3,
    max_sun_hours: 6,
    indoor_ok: true,
    watering_need: "high",
    fertilization_freq_days: 28,
    pot_size_min_liters: 4,
    difficulty: "easy",
    tags: ["herb", "shade-tolerant"],
  },
  {
    slug: "aloe-vera",
    common_name: "Aloe Vera",
    scientific_name: "Aloe barbadensis",
    min_sun_hours: 4,
    max_sun_hours: 8,
    indoor_ok: true,
    watering_need: "low",
    fertilization_freq_days: 45,
    pot_size_min_liters: 5,
    difficulty: "easy",
    tags: ["succulent", "medicinal"],
  },
  {
    slug: "chilli",
    common_name: "Chilli",
    scientific_name: "Capsicum annuum",
    min_sun_hours: 6,
    max_sun_hours: 8,
    indoor_ok: false,
    watering_need: "med",
    fertilization_freq_days: 30,
    pot_size_min_liters: 7,
    difficulty: "med",
    tags: ["fruiting", "spicy"],
  },
  {
    slug: "tomato",
    common_name: "Tomato",
    scientific_name: "Solanum lycopersicum",
    min_sun_hours: 6,
    max_sun_hours: 10,
    indoor_ok: false,
    watering_need: "high",
    fertilization_freq_days: 14,
    pot_size_min_liters: 10,
    difficulty: "med",
    tags: ["fruiting", "vegetable"],
  },
  {
    slug: "coriander",
    common_name: "Coriander",
    scientific_name: "Coriandrum sativum",
    min_sun_hours: 4,
    max_sun_hours: 6,
    indoor_ok: true,
    watering_need: "med",
    fertilization_freq_days: 21,
    pot_size_min_liters: 2,
    difficulty: "easy",
    tags: ["herb", "culinary"],
  },
  {
    slug: "spinach",
    common_name: "Spinach",
    scientific_name: "Spinacia oleracea",
    min_sun_hours: 4,
    max_sun_hours: 6,
    indoor_ok: true,
    watering_need: "high",
    fertilization_freq_days: 21,
    pot_size_min_liters: 3,
    difficulty: "easy",
    tags: ["vegetable", "leafy"],
  },
  {
    slug: "rosemary",
    common_name: "Rosemary",
    scientific_name: "Rosmarinus officinalis",
    min_sun_hours: 6,
    max_sun_hours: 8,
    indoor_ok: true,
    watering_need: "low",
    fertilization_freq_days: 30,
    pot_size_min_liters: 5,
    difficulty: "easy",
    tags: ["herb", "aromatic"],
  },
  {
    slug: "thyme",
    common_name: "Thyme",
    scientific_name: "Thymus vulgaris",
    min_sun_hours: 5,
    max_sun_hours: 7,
    indoor_ok: true,
    watering_need: "low",
    fertilization_freq_days: 30,
    pot_size_min_liters: 2,
    difficulty: "easy",
    tags: ["herb", "aromatic"],
  },
  {
    slug: "oregano",
    common_name: "Oregano",
    scientific_name: "Origanum vulgare",
    min_sun_hours: 6,
    max_sun_hours: 8,
    indoor_ok: true,
    watering_need: "low",
    fertilization_freq_days: 30,
    pot_size_min_liters: 3,
    difficulty: "easy",
    tags: ["herb", "culinary"],
  },
  {
    slug: "lettuce",
    common_name: "Lettuce",
    scientific_name: "Lactuca sativa",
    min_sun_hours: 4,
    max_sun_hours: 6,
    indoor_ok: true,
    watering_need: "high",
    fertilization_freq_days: 21,
    pot_size_min_liters: 2,
    difficulty: "easy",
    tags: ["vegetable", "leafy"],
  },
  {
    slug: "pepper",
    common_name: "Bell Pepper",
    scientific_name: "Capsicum annuum",
    min_sun_hours: 6,
    max_sun_hours: 8,
    indoor_ok: false,
    watering_need: "med",
    fertilization_freq_days: 30,
    pot_size_min_liters: 8,
    difficulty: "med",
    tags: ["fruiting", "vegetable"],
  },
];

/* normalize catalog coming from any API */
function mapCatalog(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map((p) => ({
    slug: p.slug || p.id || p._id || p.plant_slug || p.code,
    common_name: p.common_name || p.name || p.title || "-",
    scientific_name: p.scientific_name || p.scientific || p.binomial || "",
    watering_need: p.watering_need || p.water || "medium",
    fertilization_freq_days:
      p.fertilization_freq_days ?? p.fertilize_days ?? p.fert_days ?? null,
    pot_size_min_liters:
      p.pot_size_min_liters ?? p.pot_liters ?? p.pot_min_liters ?? null,
    min_sun_hours: p.min_sun_hours ?? null,
    max_sun_hours: p.max_sun_hours ?? null,
    indoor_ok: p.indoor_ok ?? null,
    difficulty: p.difficulty || null,
    tags: p.tags || [],
  }));
}

/* AI-like recommendation algorithm */
function localRecs(catalog, space, limit = 12) {
  if (!space || !catalog?.length) return [];
  
  const sun = Number(space.sunlight_hours || 0);
  const spaceType = space.type || "";
  const area = Number(space.area_sq_m || 0);
  
  const score = (plant) => {
    let score = 0;
    const reasons = [];
    
    // 1. Sunlight matching (most important - 40 points max)
    const minSun = plant.min_sun_hours ?? 0;
    const maxSun = plant.max_sun_hours ?? 12;
    if (sun >= minSun && sun <= maxSun) {
      const idealSun = (minSun + maxSun) / 2;
      const sunDiff = Math.abs(sun - idealSun);
      const sunScore = 40 * (1 - sunDiff / 6); // Perfect match = 40, off by 6h = 0
      score += Math.max(0, sunScore);
      reasons.push(`Perfect sunlight match (${sun}h)`);
    } else {
      reasons.push(`Sunlight mismatch (needs ${minSun}-${maxSun}h, space has ${sun}h)`);
    }
    
    // 2. Indoor/Outdoor compatibility (20 points)
    const isIndoor = spaceType === "windowsill";
    if (plant.indoor_ok !== null) {
      if ((isIndoor && plant.indoor_ok) || (!isIndoor && !plant.indoor_ok)) {
        score += 20;
        reasons.push(isIndoor ? "Indoor-friendly" : "Outdoor-optimized");
      } else if (isIndoor && !plant.indoor_ok) {
        score -= 15;
        reasons.push("Not suitable for indoor");
      }
    }
    
    // 3. Space type matching (15 points)
    if (spaceType === "balcony" || spaceType === "terrace") {
      if (plant.tags?.includes("fruiting") || plant.tags?.includes("vegetable")) {
        score += 15;
        reasons.push("Great for outdoor growing");
      }
    } else if (spaceType === "windowsill") {
      if (plant.tags?.includes("herb") || plant.indoor_ok) {
        score += 15;
        reasons.push("Perfect for windowsill");
      }
    }
    
    // 4. Difficulty bonus (10 points for easy plants)
    if (plant.difficulty === "easy") {
      score += 10;
      reasons.push("Easy to care for");
    } else if (plant.difficulty === "hard") {
      score -= 5;
      reasons.push("Requires experience");
    }
    
    // 5. Pot size vs space area (10 points)
    if (plant.pot_size_min_liters && area > 0) {
      const potArea = plant.pot_size_min_liters * 0.1; // rough conversion
      if (area >= potArea) {
        score += 10;
        reasons.push("Fits your space");
      } else {
        score -= 5;
        reasons.push("May need larger space");
      }
    }
    
    // 6. Watering need matching (5 points)
    const wn = String(plant.watering_need || "med").toLowerCase();
    if (sun >= 6 && (wn === "med" || wn === "high")) {
      score += 5;
      reasons.push("Water needs match sunlight");
    } else if (sun < 4 && wn === "low") {
      score += 5;
      reasons.push("Low water need for low light");
    }
    
    // Calculate final score (0-100 scale)
    const finalScore = Math.min(100, Math.max(0, Math.round(score * 10) / 10));
    
    // Generate AI-like rationale
    const topReason = reasons[0] || "General match";
    const rationale = finalScore >= 70 
      ? `🤖 Excellent match: ${topReason}. This plant is well-suited for your ${spaceType} space.`
      : finalScore >= 50
      ? `🤖 Good match: ${topReason}. Consider this plant for your space.`
      : `🤖 Fair match: ${topReason}. May require extra attention.`;
    
    return { score: finalScore, rationale, reasons };
  };
  
  return catalog
    .map((p) => {
      const result = score(p);
      return {
        plant_slug: p.slug,
        common_name: p.common_name,
        scientific_name: p.scientific_name,
        score: result.score,
        rationale: result.rationale,
        reasons: result.reasons,
        plant: p, // Include full plant data
      };
    })
    .filter((r) => r.score > 0) // Only show plants with positive scores
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/* ------------------------------- component ------------------------------ */
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
            (data) => Array.isArray(data) || Array.isArray(data?.rows) || Array.isArray(data?.plants)
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
          // Use default plants if no API
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
            (data) => Array.isArray(data) || Array.isArray(data?.rows) || Array.isArray(data?.plants)
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

      // 3) spaces (prefer cache; otherwise try API used by Spaces page)
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
        <h1 className="text-xl sm:text-2xl font-semibold text-emerald-900 dark:text-slate-100">My Plants</h1>
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

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-emerald-200 dark:border-slate-700 p-6 bg-white dark:bg-slate-800 text-emerald-800 dark:text-slate-200">
          {myPlants.length === 0
            ? <>No plants yet. Click <b>Add Plant</b> to start your garden 🌿</>
            : "No plants match your search."}
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
                <div className="h-24 w-full">
                  <img
                    src={LIGHT_IMG}
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
                        {cat.common_name} <span className="text-emerald-700/60 dark:text-emerald-300/60">•</span>{" "}
                        <i>{cat.scientific_name}</i>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-lg bg-emerald-50 dark:bg-slate-700/40 border border-emerald-200 dark:border-slate-600 text-emerald-800 dark:text-slate-200 capitalize">
                      {up.status || "active"}
                    </span>
                  </div>

                  {/* chips */}
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <Chip icon={<FaMapMarkerAlt />} label="Space" value={sp?.name || "-"} />
                    <Chip
                      icon={<FaSun />}
                      label="Light"
                      value={sp?.sunlight_hours != null ? `${sp.sunlight_hours}h` : "-"}
                    />
                    <Chip icon={<FaTint />} label="Water" value={(cat.watering_need || "-").toUpperCase()} />
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <Chip
                      icon={<FaFlask />}
                      label="Fertilize"
                      value={cat.fertilization_freq_days ? `~${cat.fertilization_freq_days}d` : "-"}
                    />
                    <Chip
                      icon={<FaLeaf />}
                      label="Pot"
                      value={cat.pot_size_min_liters ? `${cat.pot_size_min_liters}L+` : "-"}
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
      <div className="mt-0.5 font-medium text-emerald-900 dark:text-slate-100">{value}</div>
    </div>
  );
}

/* ---------------------------- Add plant modal --------------------------- */
function AddPlantModal({ spaces, catalog, plantsBase, catalogBase, onClose, onAdded }) {
  const user = getUser();
  const [spaceId, setSpaceId] = useState(spaces[0]?.id || spaces[0]?._id || "");
  const [nickname, setNickname] = useState("");
  const [plantSlug, setPlantSlug] = useState("");
  const [recs, setRecs] = useState([]);

  // Always fetch recommendations based on selected space
  useEffect(() => {
    const run = async () => {
      if (!spaceId) {
        setRecs([]);
        return;
      }
      // try API suggestion if present
      try {
        if (catalogBase) {
          const url = `${catalogBase}/suggestions?spaceId=${encodeURIComponent(spaceId)}`;
          const { data } = await api.get(url);
          const arr = Array.isArray(data) ? data : data?.rows || data?.suggestions;
          if (Array.isArray(arr) && arr.length) {
            setRecs(
              arr.map((r) => ({
                plant_slug: r.plant_slug || r.slug || r.id,
                common_name: r.common_name || r.name,
                scientific_name: r.scientific_name || "",
                score: r.score ?? 1,
                rationale: r.rationale || "Suggested by API",
                plant: catalog?.find((p) => p.slug === (r.plant_slug || r.slug || r.id)),
              }))
            );
            return;
          }
        }
      } catch {
        /* ignore and compute locally */
      }
      // local AI recommendations
      const sp = (spaces || []).find((s) => (s.id || s._id) === spaceId);
      const allCatalog = catalog && catalog.length > 0 ? catalog : DEFAULT_PLANTS;
      setRecs(localRecs(allCatalog, sp, 12));
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spaceId, catalogBase]);

  const allCatalog = catalog && catalog.length > 0 ? catalog : DEFAULT_PLANTS;
  const recSlugs = new Set(recs.map((r) => r.plant_slug));
  const options = allCatalog;

  const submit = async (e) => {
    e.preventDefault();
    if (!user) return alert("No user found. Please login again.");
    if (!spaceId) return alert("Please select a space");
    if (!plantSlug) return alert("Please select a plant");

    const payload = {
      user_id: user._id || user.id,
      space_id: spaceId,
      plant_slug: plantSlug,
      nickname: nickname.trim(),
    };

    // optimistic local
    const optimistic = {
      id: String(Date.now()),
      user_id: payload.user_id,
      space_id: payload.space_id,
      plant_id: payload.plant_slug,
      nickname: payload.nickname,
      status: "active",
    };

    try {
      if (plantsBase) {
        const { data } = await api.post(plantsBase, payload);
        const row = data?.plant || data?.userPlant || data;
        if (row && (row.id || row._id)) {
          onAdded(row);
          return;
        }
      }
      // fallback local
      const list = loadLocal(LS_USER_PLANTS, []);
      const next = [optimistic, ...list];
      saveLocal(LS_USER_PLANTS, next);
      onAdded(optimistic);
    } catch {
      // still fallback local
      const list = loadLocal(LS_USER_PLANTS, []);
      const next = [optimistic, ...list];
      saveLocal(LS_USER_PLANTS, next);
      onAdded(optimistic);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden my-4 sm:my-8">
        <div className="px-4 sm:px-5 py-2 sm:py-3 border-b border-gray-200 dark:border-slate-700 bg-emerald-600 text-white font-semibold text-sm sm:text-base">
          Add Plant
        </div>
        <form onSubmit={submit} className="p-4 sm:p-5 space-y-3 sm:space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Select Space</label>
            <select
              className="w-full rounded-xl border border-gray-300 dark:border-slate-600 px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm sm:text-base"
              value={spaceId}
              onChange={(e) => setSpaceId(e.target.value)}
            >
              {(spaces || []).map((s) => (
                <option key={s.id || s._id} value={s.id || s._id}>
                  {s.name} ({s.sunlight_hours}h sun, {s.type})
                </option>
              ))}
            </select>
          </div>

          {/* AI Recommendations Section - Always Visible */}
          {recs.length > 0 && (
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 rounded-xl p-3 sm:p-4 border border-purple-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-3">
                <FaRobot className="text-purple-600 dark:text-purple-400" />
                <h3 className="text-xs sm:text-sm font-semibold text-purple-900 dark:text-purple-200">
                  🤖 AI Recommendations for This Space
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 max-h-64 overflow-y-auto">
                {recs.slice(0, 6).map((r) => {
                  const plant = r.plant || allCatalog.find((p) => p.slug === r.plant_slug);
                  return (
                    <div
                      key={r.plant_slug}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        r.plant_slug === plantSlug
                          ? "border-purple-500 bg-purple-100 dark:bg-purple-900/30 shadow-md"
                          : "border-purple-200 dark:border-slate-600 hover:border-purple-300 dark:hover:border-purple-500 hover:shadow-sm bg-white dark:bg-slate-800"
                      }`}
                      onClick={() => setPlantSlug(r.plant_slug)}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex-1">
                          <div className="font-semibold text-sm text-purple-900 dark:text-purple-100">
                            {r.common_name}
                          </div>
                          <div className="text-xs text-purple-700/80 dark:text-purple-300/80 italic">
                            {r.scientific_name}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                            {Math.round(r.score)}
                          </div>
                          <div className="text-xs text-purple-600/70 dark:text-purple-400/70">Match</div>
                        </div>
                      </div>
                      <p className="text-xs text-purple-800/90 dark:text-purple-200/90 mt-1 line-clamp-2">
                        {r.rationale}
                      </p>
                      {plant && (
                        <div className="flex gap-2 mt-2 text-xs">
                          <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/40 rounded text-purple-800 dark:text-purple-200">
                            {plant.difficulty || "easy"}
                          </span>
                          <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/40 rounded text-purple-800 dark:text-purple-200">
                            {plant.watering_need || "med"}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Or Select Plant Manually
            </label>
            <select
              className="w-full rounded-xl border border-gray-300 dark:border-slate-600 px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm sm:text-base"
              value={plantSlug}
              onChange={(e) => setPlantSlug(e.target.value)}
            >
              <option value="">-- Select a plant --</option>
              {options.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.common_name} ({p.scientific_name})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-200 mb-1">Nickname (optional)</label>
            <input
              className="w-full rounded-xl border border-gray-300 dark:border-slate-600 px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm sm:text-base"
              placeholder="My Basil"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
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
              Add
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

