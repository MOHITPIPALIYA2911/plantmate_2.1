const CareTask = require("../models/CareTask");
const UserPlant = require("../models/UserPlant");
const Plant = require("../models/Plant");
const Space = require("../models/Space");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { sendEmail } = require("../utils/email");

// Helper: check if due today
function isDueToday(dueAt) {
  if (!dueAt) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(dueAt);
  dueDate.setHours(0, 0, 0, 0);
  return dueDate.getTime() === today.getTime();
}

async function runCareScheduler() {
  console.log("🌱 Running care task scheduler...");

  try {
    // Get start and end of today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Find all pending or snoozed tasks due today
    const tasks = await CareTask.find({
      status: { $in: ['pending', 'snoozed'] },
      due_at: { $gte: todayStart, $lte: todayEnd }
    });

    console.log(`Found ${tasks.length} tasks due today`);

    for (const task of tasks) {
      try {
        // Get user
        const user = await User.findById(task.user_id);
        if (!user || !user.email) {
          console.log(`Skipping task ${task._id}: user not found or no email`);
          continue;
        }

        // Get plant info
        let plantName = 'Your plant';
        let spaceName = '';
        
        if (task.user_plant_id) {
          const userPlant = await UserPlant.findById(task.user_plant_id);
          if (userPlant) {
            plantName = userPlant.nickname || 'Your plant';
            
            if (userPlant.plant_slug) {
              const plant = await Plant.findOne({ slug: userPlant.plant_slug });
              if (plant && !userPlant.nickname) {
                plantName = plant.common_name || plantName;
              }
            }
            
            if (userPlant.space_id) {
              const space = await Space.findById(userPlant.space_id);
              if (space) {
                spaceName = space.name || '';
              }
            }
          }
        } else {
          // For tasks created without user_plant_id, try to extract from note or use generic
          // Note: CareTask model doesn't store plantName/spaceName, so we use generic
          plantName = 'Your plant';
        }

        // Check if notification already exists for this task
        const existingNotif = await Notification.findOne({
          user_id: user._id,
          task_id: String(task._id),
          dueAt: task.due_at,
          read: false
        });

        if (existingNotif) {
          console.log(`Notification already exists for task ${task._id}`);
          continue;
        }

        // Create notification message
        const taskTypeLabel = task.type === 'water' ? 'Watering' : 'Fertilizing';
        const title = `${taskTypeLabel} Reminder`;
        const message = `${plantName}${spaceName ? ` (${spaceName})` : ''}: ${taskTypeLabel.toLowerCase()} is due today${task.note ? ` - ${task.note}` : ''}`;

        // Create notification
        const notif = await Notification.create({
          user_id: user._id,
          plant_id: task.user_plant_id ? String(task.user_plant_id) : null,
          plant_name: plantName,
          task_type: task.type,
          task_id: String(task._id),
          message: message,
          title: title,
          dueAt: task.due_at,
        });

        console.log(`Created notification ${notif._id} for user ${user.email}`);

        // Send email
        if (process.env.SMTP_EMAIL && process.env.SMTP_PASS) {
          try {
            await sendEmail(
              user.email,
              `🌱 PlantMate: ${title}`,
              `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #059669;">${title}</h2>
                  <p>${message}</p>
                  <p style="color: #666; font-size: 14px;">Due: ${new Date(task.due_at).toLocaleString()}</p>
                  <p style="margin-top: 20px; color: #666; font-size: 12px;">
                    Visit <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/care">your care tasks</a> to mark this as done.
                  </p>
                </div>
              `
            );
            notif.sent_email = true;
            await notif.save();
            console.log(`Email sent to ${user.email} for task ${task._id}`);
          } catch (emailErr) {
            console.error(`Email error for ${user.email}:`, emailErr.message);
            // Don't fail the whole process if email fails
          }
        } else {
          console.warn("SMTP_EMAIL or SMTP_PASS not configured, skipping email");
        }
      } catch (taskErr) {
        console.error(`Error processing task ${task._id}:`, taskErr.message);
        // Continue with next task
      }
    }

    console.log("✅ Care task scheduler completed");
  } catch (err) {
    console.error("❌ Error in care scheduler:", err);
  }
}

module.exports = { runCareScheduler };
