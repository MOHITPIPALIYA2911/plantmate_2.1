// src/controllers/plants.controller.js
const Plant = require('../models/Plant');
const Space = require('../models/Space');
const { getPlantSuggestions } = require("../services/aiClient");
const { asyncHandler } = require('./_helpers');
const { Types } = require('mongoose');


exports.listCatalog = asyncHandler(async (_req, res) => {
  res.json(await Plant.find({}).sort({ common_name: 1 }));
});

exports.suggestions = asyncHandler(async (req, res) => {
  const { spaceId, limit = 12 } = req.query;
  
  // Validate spaceId format
  if (!Types.ObjectId.isValid(spaceId)) {
    return res.json([]);
  }
  
  const s = await Space.findOne({ _id: spaceId, user_id: req.user.id });
  if (!s) return res.json([]);
  
  const q = {
    min_sun_hours: { $lte: s.sunlight_hours },
    max_sun_hours: { $gte: s.sunlight_hours },
  };
  
  const list = await Plant.find(q).limit(Number(limit));
  const mapped = list.map((p) => ({
    plant_slug: p.slug,
    common_name: p.common_name,
    scientific_name: p.scientific_name,
    score: 100 - Math.abs(((p.min_sun_hours + p.max_sun_hours) / 2) - s.sunlight_hours) * 10,
    rationale: `Matches ~${s.sunlight_hours}h sunlight`,
  }));
  
  res.json(mapped);
});

// GET /api/plants/ai-suggestions?spaceId=...
exports.aiSuggestions = asyncHandler(async (req, res) => {
  const { spaceId } = req.query;

  if (!spaceId) {
    return res.status(400).json({ message: "spaceId is required" });
  }

  // 1) Space load karo
  const space = await Space.findById(spaceId);
  if (!space) {
    return res.status(404).json({ message: "Space not found" });
  }

  // 2) Catalog plants load karo (baad me filter bhi kar sakte ho)
  const plants = await Plant.find({});

  // 3) Try: Gemini se recommendations
  try {
    const recs = await getPlantSuggestions(space, plants);

    // Gemini response ko frontend format me convert karo
    const suggestions = recs
      .map((r) => {
        const plant =
          plants.find((p) => p.slug === r.plant_slug) ||
          plants.find((p) => String(p._id) === String(r.plant_slug));

        if (!plant) return null;

        return {
          plant_slug: plant.slug,
          common_name: plant.common_name,
          scientific_name: plant.scientific_name,
          score: r.score ?? 1,
          rationale: r.rationale || "Suggested by AI",
          tags: r.tags || [],
        };
      })
      .filter(Boolean);

    if (!suggestions.length) {
      throw new Error("Empty AI suggestions");
    }

    return res.json({ suggestions });
  } catch (err) {
    console.error("AI suggestion error, using fallback:", err.message);

    // 4) Fallback (simple rule-based: top N plants without scoring)
    const fallback = plants.slice(0, 10).map((p) => ({
      plant_slug: p.slug,
      common_name: p.common_name,
      scientific_name: p.scientific_name,
      score: 50,
      rationale: "Rule-based fallback suggestion.",
      tags: ["fallback"],
    }));

    return res.json({ suggestions: fallback });
  }
});
