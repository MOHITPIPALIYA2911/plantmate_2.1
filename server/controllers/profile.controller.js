// src/controllers/profile.controller.js
const Profile = require('../models/Profile');
const { asyncHandler } = require('./_helpers');

exports.getMe = asyncHandler(async (req, res) => {
  const doc = await Profile.findOne({ user_id: req.user.id });
  res.json(doc || {});
});

exports.updateMe = asyncHandler(async (req, res) => {
  const { settings, ...rest } = req.body || {};
  const doc = await Profile.findOneAndUpdate(
    { user_id: req.user.id },
    { $set: { ...(rest || {}), ...(settings ? { settings } : {}) } },
    { new: true, upsert: true }
  );
  res.json(doc);
});
