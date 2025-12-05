// src/controllers/profile.controller.js
const Profile = require('../models/Profile');
const User = require('../models/User');
const { asyncHandler } = require('./_helpers');

exports.getMe = asyncHandler(async (req, res) => {
  const doc = await Profile.findOne({ user_id: req.user.id });
  res.json(doc || {});
});

exports.updateMe = asyncHandler(async (req, res) => {
  const { settings, first_Name, LastName, ...rest } = req.body || {};
  
  // Update User model if name fields are provided
  if (first_Name !== undefined || LastName !== undefined) {
    const userUpdate = {};
    if (first_Name !== undefined) userUpdate.first_Name = first_Name;
    if (LastName !== undefined) userUpdate.LastName = LastName;
    
    await User.findByIdAndUpdate(req.user.id, { $set: userUpdate });
  }
  
  // Update Profile model
  const profileUpdate = { ...(rest || {}) };
  if (settings) profileUpdate.settings = settings;
  
  const doc = await Profile.findOneAndUpdate(
    { user_id: req.user.id },
    { $set: profileUpdate },
    { new: true, upsert: true }
  );
  res.json(doc);
});
