// src/controllers/userPlants.controller.js
const UserPlant = require('../models/UserPlant');
const Plant = require('../models/Plant');
const { asyncHandler } = require('./_helpers');

exports.list = asyncHandler(async (req, res) => {
  res.json(await UserPlant.find({ user_id: req.user.id }).sort({ createdAt: -1 }));
});

exports.create = asyncHandler(async (req, res) => {
  const { space_id, plant_slug, nickname } = req.body;
  const exists = await Plant.findOne({ slug: plant_slug });
  if (!exists) return res.status(400).json({ message: 'Unknown plant slug' });
  const doc = await UserPlant.create({ user_id: req.user.id, space_id, plant_slug, nickname });
  res.status(201).json(doc);
});

exports.remove = asyncHandler(async (req, res) => {
  await UserPlant.deleteOne({ _id: req.params.id, user_id: req.user.id });
  res.json({ ok: true });
});
