const express = require("express");
const notificationController = require("../controllers/ticket.controller");
const ticketMiddleware = require("../middlewares/ticket.middleware");

const router = express.Router();

/**
 * Create Notification
 */
router.post(
  "/",
  ticketMiddleware.verifyTicketNotificationCreateRequest,
  notificationController.createTicketNotification
);

/**
 * Get Pending Notifications - MUST be before :id route
 */
router.get(
  "/status/pending",
  notificationController.getPendingNotifications
);

/**
 * Get Notification By ID
 */
router.get(
  "/:id",
  notificationController.getNotificationById
);

/**
 * Get All Notifications - For Admin (Optional)
 */
router.get(
  "/",
  notificationController.getAllNotifications
);

module.exports = router;