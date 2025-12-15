const cron = require("node-cron");
const { runCareScheduler } = require("./services/careScheduler");

// Run every hour to check for due tasks
cron.schedule("0 * * * *", async () => {
  console.log("⏰ Hourly Care Scheduler Running...");
  await runCareScheduler();
});

// Also run immediately on server start (for testing)
if (process.env.NODE_ENV !== 'production') {
  console.log("🌱 Running initial care scheduler check...");
  setTimeout(() => {
    runCareScheduler();
  }, 5000); // Wait 5 seconds for DB connection
}
