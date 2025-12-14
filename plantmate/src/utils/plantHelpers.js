// src/utils/plantHelpers.js
import api from "../lib/api";

/* ---------- storage keys & endpoint candidates ---------- */
export const LS_USER = "user";
export const LS_SPACES = "spaces";
export const LS_USER_PLANTS = "pm_user_plants";
export const LS_CATALOG = "pm_catalog_plants";
export const LS_PLANTS_API_BASE = "pm_user_plants_api_base";
export const LS_CATALOG_API_BASE = "pm_catalog_api_base";

export const CANDIDATE_PLANTS = ["/api/user-plants", "/api/plants/user", "/api/plants/my"];
export const CANDIDATE_CATALOG = ["/api/catalog/plants", "/api/plants/catalog", "/api/plants"];

/* ---------- helpers ---------- */
export const getId = (row) => row?.id || row?._id;

export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem(LS_USER) || "null");
  } catch {
    return null;
  }
};

export function loadLocal(key, fallback = null) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

export function saveLocal(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {}
}

export async function discoverBase(candidates, saveKey, parseFn) {
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
export const DEFAULT_PLANTS = [
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
  // ... baaki jo tere paas pehle the, same hi rakh
];

/* normalize catalog coming from any API */
export function mapCatalog(arr) {
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

/* Rule-based local recommendation – fallback when AI not available */
export function localRecs(catalog, space, limit = 12) {
  if (!space || !catalog?.length) return [];

  const sun = Number(space.sunlight_hours || 0);
  const spaceType = space.type || "";
  const area = Number(space.area_sq_m || 0);

  const scorePlant = (plant) => {
    let score = 0;
    const reasons = [];

    const minSun = plant.min_sun_hours ?? 0;
    const maxSun = plant.max_sun_hours ?? 12;
    if (sun >= minSun && sun <= maxSun) {
      const idealSun = (minSun + maxSun) / 2;
      const sunDiff = Math.abs(sun - idealSun);
      const sunScore = 40 * (1 - sunDiff / 6);
      score += Math.max(0, sunScore);
      reasons.push(`Perfect sunlight match (${sun}h)`);
    } else {
      reasons.push(`Sunlight mismatch (needs ${minSun}-${maxSun}h, space has ${sun}h)`);
    }

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

    if (plant.difficulty === "easy") {
      score += 10;
      reasons.push("Easy to care for");
    } else if (plant.difficulty === "hard") {
      score -= 5;
      reasons.push("Requires experience");
    }

    if (plant.pot_size_min_liters && area > 0) {
      const potArea = plant.pot_size_min_liters * 0.1;
      if (area >= potArea) {
        score += 10;
        reasons.push("Fits your space");
      } else {
        score -= 5;
        reasons.push("May need larger space");
      }
    }

    const wn = String(plant.watering_need || "med").toLowerCase();
    if (sun >= 6 && (wn === "med" || wn === "high")) {
      score += 5;
      reasons.push("Water needs match sunlight");
    } else if (sun < 4 && wn === "low") {
      score += 5;
      reasons.push("Low water need for low light");
    }

    const finalScore = Math.min(100, Math.max(0, Math.round(score * 10) / 10));
    const topReason = reasons[0] || "General match";

    const rationale =
      finalScore >= 70
        ? `🤖 Excellent match: ${topReason}. This plant is well-suited for your ${spaceType} space.`
        : finalScore >= 50
        ? `🤖 Good match: ${topReason}. Consider this plant for your space.`
        : `🤖 Fair match: ${topReason}. May require extra attention.`;

    return { score: finalScore, rationale, reasons };
  };

  return catalog
    .map((p) => {
      const result = scorePlant(p);
      return {
        plant_slug: p.slug,
        common_name: p.common_name,
        scientific_name: p.scientific_name,
        score: result.score,
        rationale: result.rationale,
        reasons: result.reasons,
        plant: p,
      };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
