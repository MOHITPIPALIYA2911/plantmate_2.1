// server/routes/notifications.routes.js
const express = require("express");
const router = express.Router();

const { asyncHandler } = require("../controllers/_helpers");
const notifications = require("../controllers/notifications.controller");

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
