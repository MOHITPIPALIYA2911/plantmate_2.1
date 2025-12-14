// src/controllers/plants.controller.js
const Space = require('../models/Space');
const { getPlantSuggestions } = require("../services/aiClient");
const { asyncHandler } = require('./_helpers');
const { FULL_CATALOG } = require("../data");

/**
 * Local fallback scoring
 */
function localRecsBackend(plants, space, limit = 12) {
  const sun = Number(space.sunlight_hours || 0);
  const spaceType = space.type || "";
  const area = Number(space.area_sq_m || 0);

  const scored = plants.map((p) => {
    let score = 0;

    // Sun match (40 points)
    const min = p.min_sun_hours ?? 0;
    const max = p.max_sun_hours ?? 12;
    if (sun >= min && sun <= max) {
      const ideal = (min + max) / 2;
      const diff = Math.abs(sun - ideal);
      score += 40 * (1 - diff / 6);
    } else {
      score -= 10;
    }

    // Space-specific bonus (20 points)
    if (spaceType === "windowsill" || spaceType === "indoor") {
      if (p.indoor_ok || p.tags?.includes("shade-tolerant")) {
        score += 20;
      }
    }
    if (spaceType === "balcony" || spaceType === "terrace") {
      if (p.tags?.includes("vegetable") || p.tags?.includes("fruiting") || p.tags?.includes("outdoor")) {
        score += 20;
      }
    }

    // Difficulty bonus
    if (p.difficulty === "easy") score += 10;

    // Pot size
    if (p.pot_size_min_liters && area > 0) {
      const required = p.pot_size_min_liters * 0.1;
      if (area >= required) score += 10;
      else score -= 5;
    }

    return { plant: p, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ plant, score }) => ({
      plant_slug: plant.slug,
      common_name: plant.common_name,
      scientific_name: plant.scientific_name,
      score: Math.round(score),
      rationale: `Matched via fallback scoring for ${space.sunlight_hours}h sunlight.`,
      tags: ["fallback"]
    }));
}

/**
 * Old catalog endpoint still returns DB catalog (keep or remove)
 */
exports.listCatalog = asyncHandler(async (_req, res) => {
  res.json(FULL_CATALOG); // ⭐ Now always return JSON catalog
});

/**
 * OLD suggestions API (keep for backward compatibility)
 */
exports.suggestions = asyncHandler(async (req, res) => {
  return res.json([]); // deprecated
});

/**
 * AI SUGGESTIONS — main endpoint
 * GET /api/plants/ai-suggestions?spaceId=...
 */
exports.aiSuggestions = asyncHandler(async (req, res) => {
  const { spaceId } = req.query;

  if (!spaceId) {
    return res.status(400).json({ message: "spaceId is required" });
  }

  const space = await Space.findById(spaceId);
  if (!space) {
    return res.status(404).json({ message: "Space not found" });
  }

  // ⭐ USE JSON CATALOG (no DB)
  let plants = [...FULL_CATALOG];

  // ⭐ FILTER BASED ON SPACE TYPE
  if (space.type === "windowsill" || space.type === "indoor") {
    plants = plants.filter(
      p => p.indoor_ok === true || p.tags.includes("shade-tolerant")
    );
  }

  if (space.type === "balcony" || space.type === "terrace") {
    plants = plants.filter(
      p => p.tags.includes("outdoor") ||
           p.tags.includes("flower") ||
           p.tags.includes("vegetable")
    );
  }

  // ⭐ CALL AI FIRST
  try {
    const recs = await getPlantSuggestions(space, plants);

    if (!recs || recs.length === 0) {
      throw new Error("Empty AI result");
    }

    // Format output
    const suggestions = recs.map((r) => {
      const plant = plants.find((p) => p.slug === r.plant_slug);
      if (!plant) return null;

      return {
        plant_slug: plant.slug,
        common_name: plant.common_name,
        scientific_name: plant.scientific_name,
        score: r.score ?? 1,
        rationale: r.rationale || "Suggested by AI",
        tags: r.tags || []
      };
    }).filter(Boolean);

    return res.json({ suggestions });
  } catch (err) {
    console.error("AI FAILED → Using fallback:", err.message);
    const fallback = localRecsBackend(plants, space, 30);
    return res.json({ suggestions: fallback });
  }
});
