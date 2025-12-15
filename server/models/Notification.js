//server/models/Notification.js
const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    plant_id: { type: String }, // Plant slug or ID
    plant_name: { type: String },
    task_id: { type: String }, // CareTask ID

    task_type: { type: String }, // "water", "fertilize", etc.
    title: { type: String }, // Notification title for frontend
    message: { type: String, required: true },

    dueAt: { type: Date },

    read: { type: Boolean, default: false },
    sent_email: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", NotificationSchema);
