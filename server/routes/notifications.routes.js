const router = require("express").Router();
const Notification = require("../models/Notification");
const auth = require("../middleware/authRequired");

// Get user notifications
router.get("/", auth, async (req, res) => {
  const list = await Notification.find({ user_id: req.user.id }).sort({ createdAt: -1 });
  res.json(list);
});

// Mark as read
router.put("/:id/read", auth, async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { read: true });
  res.json({ success: true });
});

module.exports = router;
