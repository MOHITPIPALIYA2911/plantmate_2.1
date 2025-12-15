// server/routes/notifications.routes.js
const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const { asyncHandler, requireAuth } = require("../controllers/_helpers");

// 🔹 List notifications (already hoga, reference ke liye)
router.get("/", requireAuth, asyncHandler(async (req, res) => {
  const { limit = 100 } = req.query;
  const rows = await Notification.find({ user_id: req.user.id })
    .sort({ createdAt: -1 })
    .limit(Number(limit));
  res.json({ notifications: rows });
}));

// 🔹 YEH NEW ROUTE HAI – unread badge ke liye
router.get("/unread-count", requireAuth, asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({
    user_id: req.user.id,
    read: false,
  });
  res.json({ count });
}));

// (optional) mark single notification as read
router.post("/:id/read", requireAuth, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const doc = await Notification.findOneAndUpdate(
    { _id: id, user_id: req.user.id },
    { $set: { read: true } },
    { new: true }
  );
  if (!doc) return res.status(404).json({ message: "Notification not found" });
  res.json({ notification: doc });
}));

// (optional) mark all read
router.post("/read-all", requireAuth, asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { user_id: req.user.id, read: false },
    { $set: { read: true } }
  );
  res.json({ ok: true });
}));

module.exports = router;
