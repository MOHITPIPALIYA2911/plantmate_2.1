// src/controllers/spaces.controller.js
const Space = require('../models/Space');
const { asyncHandler } = require('./_helpers');

exports.list = asyncHandler(async (req, res) => {
  res.json(await Space.find({ user_id: req.user.id }).sort({ createdAt: -1 }));
});

exports.create = asyncHandler(async (req, res) => {
  const doc = await Space.create({ user_id: req.user.id, ...req.body });
  res.status(201).json(doc);
});

exports.update = asyncHandler(async (req, res) => {
  const doc = await Space.findOneAndUpdate(
    { _id: req.params.id, user_id: req.user.id },
    { $set: req.body },
    { new: true }
  );
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json(doc);
});

exports.remove = asyncHandler(async (req, res) => {
  await Space.deleteOne({ _id: req.params.id, user_id: req.user.id });
  res.json({ ok: true });
});
