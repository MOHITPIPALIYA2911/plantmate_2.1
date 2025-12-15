const Space = require("../models/Space");
const Plant = require("../models/Plant"); // if needed
const User = require("../models/User");
const Notification = require("../models/Notification");
const { sendEmail } = require("../utils/email");

// Helper: check if due today
function isDue(dueAt) {
  const today = new Date();
  const d = new Date(dueAt);
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );
}

async function runCareScheduler() {
  console.log("🌱 Running care task scheduler...");

  const spaces = await Space.find({});
  const users = await User.find({}); // optional if mapping needed

  for (const space of spaces) {
    const user = users.find((u) => String(u._id) === String(space.user_id));
    if (!user || !user.email) continue;

    const plants = space.plants || []; // from Care.js format

    for (const p of plants) {
      if (!p.careTasks) continue;

      for (const task of p.careTasks) {
        if (!task.dueAt) continue;

        if (!isDue(task.dueAt)) continue;

        const msg = `${p.nickname || p.plantName}: ${task.type} is due today`;

        // Avoid duplicate notification
        const exists = await Notification.findOne({
          user_id: user._id,
          plant_id: p.id,
          task_type: task.type,
          dueAt: task.dueAt,
        });

        if (exists) continue;

        // Create notification
        const notif = await Notification.create({
          user_id: user._id,
          plant_id: p.id,
          plant_name: p.nickname || p.plantName,
          task_type: task.type,
          message: msg,
          dueAt: task.dueAt,
        });

        // Send email
        try {
          await sendEmail(
            user.email,
            `Plant Care Reminder: ${task.type}`,
            `<p>${msg}</p>`
          );
          notif.sent_email = true;
          await notif.save();
        } catch (err) {
          console.log("Email error:", err.message);
        }
      }
    }
  }
}

module.exports = { runCareScheduler };
