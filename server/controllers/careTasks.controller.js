// src/controllers/careTasks.controller.js
const CareTask = require('../models/CareTask');
const UserPlant = require('../models/UserPlant');
const Space = require('../models/Space');
const Plant = require('../models/Plant');
const { asyncHandler } = require('./_helpers');

exports.list = asyncHandler(async (req, res) => {
  res.json(await CareTask.find({ user_id: req.user.id }).sort({ due_at: 1 }));
});

exports.create = asyncHandler(async (req, res) => {
  const doc = await CareTask.create({ user_id: req.user.id, ...req.body });
  res.status(201).json(doc);
});

exports.remove = asyncHandler(async (req, res) => {
  await CareTask.deleteOne({ _id: req.params.id, user_id: req.user.id });
  res.json({ ok: true });
});

exports.done = asyncHandler(async (req, res) => {
  const taskId = req.params.id || req.body.id;
  const t = await CareTask.findOne({ _id: taskId, user_id: req.user.id });
  if (!t) return res.status(404).json({ message: 'Not found' });
  t.status = 'done';
  t.completed_at = new Date();
  await t.save();

  if (Number(t.recurrence_days) > 0) {
    let nextDate = new Date(t.due_at);
    do { nextDate.setDate(nextDate.getDate() + Number(t.recurrence_days)); } while (nextDate <= new Date());
    const clone = t.toObject();
    delete clone._id; delete clone.createdAt; delete clone.updatedAt;
    clone.status = 'pending'; clone.completed_at = null; clone.due_at = nextDate;
    await CareTask.create(clone);
  }
  res.json({ ok: true });
});

exports.snooze = asyncHandler(async (req, res) => {
  const mins = Number(req.body.minutes || req.body.mins || 120);
  const t = await CareTask.findOne({ _id: req.params.id, user_id: req.user.id });
  if (!t) return res.status(404).json({ message: 'Not found' });
  t.due_at = new Date(Date.now() + mins * 60000);
  t.status = 'snoozed';
  await t.save();
  res.json(t);
});

exports.reschedule = asyncHandler(async (req, res) => {
  const { dueAt } = req.body;
  if (!dueAt) return res.status(400).json({ message: 'dueAt required' });
  const t = await CareTask.findOne({ _id: req.params.id, user_id: req.user.id });
  if (!t) return res.status(404).json({ message: 'Not found' });
  t.due_at = new Date(dueAt);
  t.status = 'pending';
  await t.save();
  res.json(t);
});

exports.bringToday = asyncHandler(async (req, res) => {
  const t = await CareTask.findOne({ _id: req.params.id, user_id: req.user.id });
  if (!t) return res.status(404).json({ message: 'Not found' });
  const now = new Date();
  const nextHour = new Date(now);
  nextHour.setMinutes(0, 0, 0);
  nextHour.setHours(now.getHours() + 1);
  t.due_at = nextHour;
  t.status = 'pending';
  await t.save();
  res.json(t);
});

// used by Dashboard
exports.todayWater = asyncHandler(async (req, res) => {
  const start = new Date(); start.setHours(0,0,0,0);
  const end = new Date(); end.setHours(23,59,59,999);

  const list = await CareTask.find({
    user_id: req.user.id,
    type: 'water',
    status: { $in: ['pending', 'snoozed'] },
    due_at: { $gte: start, $lte: end },
  }).sort({ due_at: 1 });

  const withMeta = await Promise.all(list.map(async (t) => {
    const up = await UserPlant.findById(t.user_plant_id);
    const sp = up ? await Space.findById(up.space_id) : null;
    const p = up ? await Plant.findOne({ slug: up.plant_slug }) : null;
    return {
      id: String(t._id),
      plantName: up?.nickname || p?.common_name || 'Plant',
      spaceName: sp?.name || '-',
      sunlightHours: sp?.sunlight_hours || 0,
      dueAt: t.due_at,
      note: t.note || (p?.watering_need ? `Watering need: ${p.watering_need}` : ''),
    };
  }));

  res.json({ waterTasks: withMeta });
});
