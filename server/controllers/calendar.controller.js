// src/controllers/calendar.controller.js
const CalendarEvent = require('../models/CalendarEvent');
const { asyncHandler } = require('./_helpers');

exports.list = asyncHandler(async (req, res) => {
  res.json(await CalendarEvent.find({ user_id: req.user.id }).sort({ start: 1 }));
});

exports.create = asyncHandler(async (req, res) => {
  const doc = await CalendarEvent.create({ user_id: req.user.id, ...req.body });
  res.status(201).json(doc);
});

exports.remove = asyncHandler(async (req, res) => {
  await CalendarEvent.deleteOne({ _id: req.params.id, user_id: req.user.id });
  res.json({ ok: true });
});
