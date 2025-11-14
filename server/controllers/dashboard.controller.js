// src/controllers/dashboard.controller.js
const { todayWater } = require('./careTasks.controller');
const CareTask = require('../models/CareTask');
const UserPlant = require('../models/UserPlant');
const Space = require('../models/Space');
const { asyncHandler } = require('./_helpers');

// expose the same "today water" data under /api/dashboard/water-tasks
exports.waterTasks = todayWater;

// Dashboard stats endpoint
exports.stats = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  
  const [totalPlants, totalSpaces, todayTasks, upcomingTasks] = await Promise.all([
    UserPlant.countDocuments({ user_id: userId, status: 'active' }),
    Space.countDocuments({ user_id: userId }),
    CareTask.countDocuments({
      user_id: userId,
      due_at: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lte: new Date(new Date().setHours(23, 59, 59, 999)),
      },
      status: { $in: ['pending', 'snoozed'] },
    }),
    CareTask.countDocuments({
      user_id: userId,
      due_at: { $gt: new Date(new Date().setHours(23, 59, 59, 999)) },
      status: { $in: ['pending', 'snoozed'] },
    }),
  ]);

  res.json({
    totalPlants,
    totalSpaces,
    todayTasks,
    upcomingTasks,
  });
});
