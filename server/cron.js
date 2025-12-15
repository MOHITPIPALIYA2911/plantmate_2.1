const cron = require("node-cron");
const { runCareScheduler } = require("./services/careScheduler");

// Run every minute to check for due tasks
cron.schedule("* * * * *", async () => {
  await runCareScheduler();
});

// Also run immediately on server start (for testing)
if (process.env.NODE_ENV !== 'production') {
  console.log("🌱 Running initial care scheduler check...");
  setTimeout(() => {
    runCareScheduler();
  }, 5000); // Wait 5 seconds for DB connection
}
