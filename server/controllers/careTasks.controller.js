// src/controllers/careTasks.controller.js
const CareTask = require('../models/CareTask');
const UserPlant = require('../models/UserPlant');
const Space = require('../models/Space');
const Plant = require('../models/Plant');
const { asyncHandler } = require('./_helpers');

// Transform snake_case to camelCase for API responses
function toCamelCase(doc, extraFields = {}) {
  if (!doc) return doc;
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    id: String(obj._id || obj.id),
    type: obj.type,
    plantName: extraFields.plantName || obj.plantName || obj.plant_name || '',
    spaceName: extraFields.spaceName || obj.spaceName || obj.space_name || '',
    sunlightHours: extraFields.sunlightHours !== undefined ? extraFields.sunlightHours : (obj.sunlightHours || obj.sunlight_hours || 0),
    dueAt: obj.dueAt || (obj.due_at ? new Date(obj.due_at).toISOString() : (obj.createdAt ? new Date(obj.createdAt).toISOString() : new Date().toISOString())),
    note: obj.note || '',
    recurrenceDays: obj.recurrenceDays || obj.recurrence_days || 0,
    status: obj.status || 'pending',
    completedAt: obj.completedAt || (obj.completed_at ? new Date(obj.completed_at).toISOString() : null),
    userPlantId: obj.userPlantId || (obj.user_plant_id ? String(obj.user_plant_id) : null),
    createdAt: obj.createdAt ? new Date(obj.createdAt).toISOString() : null,
    updatedAt: obj.updatedAt ? new Date(obj.updatedAt).toISOString() : null,
  };
}

// Transform camelCase to snake_case for database
function toSnakeCase(body) {
  return {
    type: body.type,
    due_at: body.dueAt ? new Date(body.dueAt) : body.due_at,
    note: body.note,
    recurrence_days: body.recurrenceDays || body.recurrence_days || 0,
    user_plant_id: body.userPlantId || body.user_plant_id,
    plant_name: body.plantName || body.plant_name,
    space_name: body.spaceName || body.space_name,
    sunlight_hours: body.sunlightHours || body.sunlight_hours || 0,
  };
}

exports.list = asyncHandler(async (req, res) => {
  const tasks = await CareTask.find({ user_id: req.user.id }).sort({ due_at: 1 });
  res.json(tasks.map(toCamelCase));
});

exports.create = asyncHandler(async (req, res) => {
  const data = toSnakeCase(req.body);
  // Ensure due_at is set if dueAt was provided
  if (req.body.dueAt && !data.due_at) {
    data.due_at = new Date(req.body.dueAt);
  }
  // Ensure plant_name, space_name, and sunlight_hours are saved
  if (req.body.plantName) data.plant_name = req.body.plantName;
  if (req.body.spaceName) data.space_name = req.body.spaceName;
  if (req.body.sunlightHours !== undefined) data.sunlight_hours = req.body.sunlightHours;
  
  const doc = await CareTask.create({ user_id: req.user.id, ...data });
  res.status(201).json(toCamelCase(doc));
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
  res.json(toCamelCase(t));
});

exports.reschedule = asyncHandler(async (req, res) => {
  const { dueAt } = req.body;
  if (!dueAt) return res.status(400).json({ message: 'dueAt required' });
  const t = await CareTask.findOne({ _id: req.params.id, user_id: req.user.id });
  if (!t) return res.status(404).json({ message: 'Not found' });
  t.due_at = new Date(dueAt);
  t.status = 'pending';
  await t.save();
  res.json(toCamelCase(t));
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
  res.json(toCamelCase(t));
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
