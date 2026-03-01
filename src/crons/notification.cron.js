const notificationService = require("../services/notification.service");

let isRunning = false;

const startNotificationCron = () => {
  const intervalMs = 30000; // 30 seconds

  const runJob = async () => {
    if (isRunning) {
      console.log("[CRON] Previous job still running, skipping...");
      return;
    }

    isRunning = true;

    try {
      const result = await notificationService.processPendingNotifications();

      if (result?.processed > 0) {
        console.log(
          `[CRON] Processed ${result.processed} notifications at ${new Date().toISOString()}`
        );
      }

    } catch (error) {
      console.error("[CRON] Error processing notifications:", error.message);
    } finally {
      isRunning = false;
    }
  };

  const interval = setInterval(runJob, intervalMs);

  console.log("Notification cron started (every 30 seconds)");

  // Graceful shutdown
  process.on("SIGINT", () => {
    clearInterval(interval);
    console.log("Cron stopped gracefully");
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    clearInterval(interval);
    console.log(" Cron terminated gracefully");
    process.exit(0);
  });
};

module.exports = { startNotificationCron };