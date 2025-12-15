const cron = require("node-cron");
const { runCareScheduler } = require("./services/careScheduler");

// Run daily at 7 AM
cron.schedule("0 7 * * *", async () => {
  console.log("⏰ Daily Care Scheduler Running...");
  await runCareScheduler();
});
