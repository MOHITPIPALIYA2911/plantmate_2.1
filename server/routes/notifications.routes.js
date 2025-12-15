// server/routes/notifications.routes.js
const express = require("express");
const router = express.Router();

const { asyncHandler } = require("../controllers/_helpers");
const authRequired = require("../middleware/authRequired.js");
const notifications = require("../controllers/notifications.controller");

// ✅ sab notifications routes protected
router.use(authRequired);

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
  "/mark-all-read",
  asyncHandler(notifications.markAllRead)
);

// 🔔 Alternative route for mark all as read (backward compatibility)
router.post(
  "/read-all",
  asyncHandler(notifications.markAllRead)
);

module.exports = router;
