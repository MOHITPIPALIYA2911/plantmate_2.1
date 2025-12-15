// server/routes/notifications.routes.js
const express = require("express");
const router = express.Router();

const { asyncHandler } = require("../controllers/_helpers");
// 👇 SAME middleware jo spaces / care-tasks / calendar me use karte ho
const { requireAuth } = require("../middleware/auth.middleware");
const notifications = require("../controllers/notifications.controller");

// ✅ sab notifications routes protected
router.use(requireAuth);

// 🔔 Get unread count
router.get(
  "/unread-count",
  asyncHandler(notifications.getUnreadCount)
);

// 🔔 List notifications (latest first)
router.get(
  "/",
  asyncHandler(notifications.listNotifications)
);

// 🔔 Mark single notification as read
router.post(
  "/:id/read",
  asyncHandler(notifications.markRead)
);

// 🔔 Mark all as read
router.post(
  "/read-all",
  asyncHandler(notifications.markAllRead)
);

module.exports = router;
