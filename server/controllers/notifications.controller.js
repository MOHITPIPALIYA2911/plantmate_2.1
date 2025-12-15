// server/controllers/notifications.controller.js
const Notification = require("../models/Notification");

/**
 * Helper: get current user id from req
 */
function getUserId(req) {
  return req.user?.id || req.user?._id;
}

/**
 * GET /api/notifications/unread-count
 * Return only count of unread notifications for current user
 */
async function getUnreadCount(req, res) {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ message: "Unauthenticated" });
  }

  const count = await Notification.countDocuments({
    user_id: userId,
    read: false,
  });

  res.json({ count });
}

/**
 * GET /api/notifications
 * List latest notifications for current user
 * ?limit=50 (optional)
 */
async function listNotifications(req, res) {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ message: "Unauthenticated" });
  }

  const limit = Math.min(Number(req.query.limit) || 50, 200);

  const items = await Notification.find({ user_id: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  // Ensure title field exists for frontend compatibility
  const normalized = items.map(item => ({
    ...item,
    title: item.title || item.message || 'Notification',
    type: item.task_type ? (item.task_type === 'water' || item.task_type === 'fertilize' ? 'care' : 'generic') : 'generic'
  }));

  res.json({ notifications: normalized });
}

/**
 * POST /api/notifications/:id/read
 * Mark single notification as read
 */
async function markRead(req, res) {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ message: "Unauthenticated" });
  }

  const { id } = req.params;

  const doc = await Notification.findOneAndUpdate(
    { _id: id, user_id: userId },
    { $set: { read: true } },
    { new: true }
  );

  if (!doc) {
    return res.status(404).json({ message: "Notification not found" });
  }

  res.json({ notification: doc });
}

/**
 * POST /api/notifications/read-all
 * Mark all current user's notifications as read
 */
async function markAllRead(req, res) {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ message: "Unauthenticated" });
  }

  const result = await Notification.updateMany(
    { user_id: userId, read: false },
    { $set: { read: true } }
  );

  res.json({
    updated: result.modifiedCount || result.nModified || 0,
  });
}

module.exports = {
  getUnreadCount,
  listNotifications,
  markRead,
  markAllRead,
};
