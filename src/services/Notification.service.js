const TicketNotification = require("../models/ticketNotification");
const transporter = require("../config/mail.config");
const { STATUS } = require("../utils/constants");

const MAX_RETRIES = 3;
const BASE_DELAY_MINUTES = 2;


/**
 * Create Notification
 */
const createTicketNotification = async (data) => {
  try {
    const notification = await TicketNotification.create(data);
    return notification;

  } catch (error) {
    if (error.name === "ValidationError") {
      const err = {};
      Object.keys(error.errors).forEach((key) => {
        err[key] = error.errors[key].message;
      });

      throw { err, code: STATUS.UNPROCESSABLE_ENTITY };
    }
    throw error;
  }
};


/**
 * Get Notification By ID (lean for performance)
 */
const getNotificationById = async (id) => {
  return await TicketNotification.findById(id).lean();
};


/**
 * Exponential Backoff Calculator
 */
const calculateNextRetry = (retries) => {
  const delay = BASE_DELAY_MINUTES * Math.pow(2, retries); 
  return new Date(Date.now() + delay * 60 * 1000);
};


/**
 * Atomic Send Notification (Distributed Safe)
 */
const sendNotification = async (notificationId) => {
  try {

    // Atomic lock
    const notification = await TicketNotification.findOneAndUpdate(
      {
        _id: notificationId,
        status: "PENDING",
        retries: { $lt: MAX_RETRIES },
        nextRetryAt: { $lte: new Date() },
        $or: [
          { scheduledAt: null },
          { scheduledAt: { $lte: new Date() } }
        ]
      },
      {
        $set: { status: "PROCESSING" }
      },
      { new: true }
    );

    if (!notification) return null;

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: notification.recipientEmail.join(","),
      subject: notification.subject,
      html: `<p>${notification.content}</p>`
    };

    await transporter.sendMail(mailOptions);

    // Success update
    await TicketNotification.findByIdAndUpdate(notificationId, {
      status: "SENT",
      sentAt: new Date(),
      errorMessage: null
    });

    return true;

  } catch (error) {

    const existing = await TicketNotification.findById(notificationId);

    if (!existing) throw error;

    const newRetries = (existing.retries || 0) + 1;

    if (newRetries >= MAX_RETRIES) {
      await TicketNotification.findByIdAndUpdate(notificationId, {
        status: "FAILED",
        retries: newRetries,
        errorMessage: error.message
      });
    } else {
      await TicketNotification.findByIdAndUpdate(notificationId, {
        status: "PENDING",
        retries: newRetries,
        errorMessage: error.message,
        nextRetryAt: calculateNextRetry(newRetries)
      });
    }

    throw error;
  }
};


/**
 * Batch Processor
 */
const processPendingNotifications = async () => {
  try {
    const now = new Date();

    const pendingNotifications = await TicketNotification.find({
      status: "PENDING",
      retries: { $lt: MAX_RETRIES },
      nextRetryAt: { $lte: now },
      $or: [
        { scheduledAt: null },
        { scheduledAt: { $lte: now } }
      ]
    })
      .sort({ priority: -1, createdAt: 1 })
      .limit(20)
      .select("_id") // optimize memory
      .lean();

    for (const notification of pendingNotifications) {
      try {
        await sendNotification(notification._id);
        console.log(`Sent: ${notification._id}`);
      } catch (err) {
        console.error(`Failed: ${notification._id} - ${err.message}`);
      }
    }

    return {
      processed: pendingNotifications.length
    };

  } catch (error) {
    console.error("Batch processing failed:", error);
    throw error;
  }
};

const getAllNotifications = async (req, res) => {
  try {
    const notifications = await TicketNotification.find()
      .sort({ createdAt: -1 })
      .lean();
    return sendSuccess(res, {
      statusCode: STATUS.OK,
      data: notifications,
      message: "All notifications retrieved successfully"
    });
  } catch (error) {
    return sendError(res, {
      statusCode: STATUS.INTERNAL_SERVER_ERROR,
      error: error.message,
      message: "Failed to retrieve notifications"
    });
  }
};


module.exports = {
  createTicketNotification,
  getNotificationById,
  sendNotification,
  processPendingNotifications,
  getAllNotifications
};