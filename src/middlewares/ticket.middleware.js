const { STATUS } = require("../utils/constants");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const verifyTicketNotificationCreateRequest = (req, res, next) => {
  try {
    const {
      subject,
      content,
      recipientEmail,
      priority,
      scheduledAt
    } = req.body;

    // Standard error response
    const sendError = (message, data = null) => {
      return res.status(STATUS.BAD_REQUEST).json({
        success: false,
        message,
        data
      });
    };

    //  Subject validation
    if (!subject || typeof subject !== "string" || subject.trim().length === 0) {
      return sendError("Subject is required and must be a valid string");
    }

    if (subject.trim().length > 255) {
      return sendError("Subject cannot exceed 255 characters");
    }

    // Content validation
    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return sendError("Content is required and must be a valid string");
    }

    // recipientEmail validation
    if (!recipientEmail || !Array.isArray(recipientEmail) || recipientEmail.length === 0) {
      return sendError("recipientEmail must be a non-empty array");
    }

    const normalizedEmails = recipientEmail.map((email) =>
      typeof email === "string" ? email.trim().toLowerCase() : ""
    );

    const invalidEmails = normalizedEmails.filter(
      (email) => !emailRegex.test(email)
    );

    if (invalidEmails.length > 0) {
      return sendError("Invalid email(s) found", { invalidEmails });
    }

    //  Priority validation (if provided)
    if (priority) {
      const allowedPriorities = ["LOW", "MEDIUM", "HIGH"];
      if (!allowedPriorities.includes(priority)) {
        return sendError("Invalid priority value");
      }
    }

    // Scheduled time validation
    if (scheduledAt) {
      const scheduledDate = new Date(scheduledAt);
      if (isNaN(scheduledDate.getTime())) {
        return sendError("scheduledAt must be a valid date");
      }

      if (scheduledDate < new Date()) {
        return sendError("scheduledAt cannot be in the past");
      }
    }

    // Replace original emails with normalized ones
    req.body.recipientEmail = normalizedEmails;
    req.body.subject = subject.trim();
    req.body.content = content.trim();

    next();

  } catch (error) {
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Error validating notification request",
      error: error.message
    });
  }
};

module.exports = {
  verifyTicketNotificationCreateRequest
};