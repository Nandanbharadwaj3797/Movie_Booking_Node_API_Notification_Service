const mongoose = require("mongoose");
const notificationService = require("../services/notification.service");
const { sendSuccess, sendError } = require("../utils/response");
const { STATUS } = require("../utils/constants");


/**
 * Create Notification
 */
const createTicketNotification = async (req, res) => {
  try {
    const notification = await notificationService.createTicketNotification(req.body);

    return sendSuccess(res, {
      statusCode: STATUS.CREATED,
      data: notification,
      message: "Notification created successfully"
    });

  } catch (error) {
    return sendError(res, {
      statusCode: error.code || STATUS.INTERNAL_SERVER_ERROR,
      error: error.err || error.message,
      message: "Failed to create notification"
    });
  }
};


/**
 * Get Notification By ID
 */
const getNotificationById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, {
        statusCode: STATUS.BAD_REQUEST,
        error: "Invalid notification ID",
        message: "Provided ID is not valid"
      });
    }

    const notification = await notificationService.getNotificationById(id);

    if (!notification) {
      return sendError(res, {
        statusCode: STATUS.NOT_FOUND,
        error: "Notification not found",
        message: "The requested notification does not exist"
      });
    }

    return sendSuccess(res, {
      statusCode: STATUS.OK,
      data: notification,
      message: "Notification retrieved successfully"
    });

  } catch (error) {
    return sendError(res, {
      statusCode: STATUS.INTERNAL_SERVER_ERROR,
      error: error.message,
      message: "Failed to retrieve notification"
    });
  }
};


/**
 * Get Notifications (with filtering & pagination)
 */
const getPendingNotifications = async (req, res) => {
  try {
    const TicketNotification = require("../models/ticketNotification");
    
    const notifications = await TicketNotification.find({ 
      status: "PENDING" 
    })
      .sort({ createdAt: -1 })
      .lean();

    return sendSuccess(res, {
      statusCode: STATUS.OK,
      data: notifications,
      message: "Pending notifications retrieved successfully"
    });

  } catch (error) {
    return sendError(res, {
      statusCode: STATUS.INTERNAL_SERVER_ERROR,
      error: error.message,
      message: "Failed to retrieve pending notifications"
    });
  }
};

const getAllNotifications = async (req, res) => {
  try {
    const notifications = await notificationService.getAllNotifications();
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
  getPendingNotifications,
  getAllNotifications
};