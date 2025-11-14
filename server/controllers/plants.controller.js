// src/controllers/plants.controller.js
const Plant = require('../models/Plant');
const Space = require('../models/Space');
const { asyncHandler } = require('./_helpers');

exports.listCatalog = asyncHandler(async (_req, res) => {
  res.json(await Plant.find({}).sort({ common_name: 1 }));
});

exports.suggestions = asyncHandler(async (req, res) => {
  const { spaceId, limit = 12 } = req.query;
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
