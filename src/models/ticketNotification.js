const mongoose = require("mongoose");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ticketNotificationSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
      maxlength: 255,
      index: true
    },

    content: {
      type: String,
      required: [true, "Content is required"],
      trim: true
    },

    recipientEmail: {
      type: [String],
      required: [true, "Recipient email(s) required"],
      validate: {
        validator: function (emails) {
          return emails.every((email) => emailRegex.test(email));
        },
        message: "One or more recipient emails are invalid"
      }
    },

    status: {
      type: String,
      enum: ["PENDING", "PROCESSING", "SENT", "FAILED"],
      default: "PENDING",
      index: true
    },

    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "MEDIUM",
      index: true
    },

    retries: {
      type: Number,
      default: 0,
      min: 0
    },

    nextRetryAt: {
      type: Date,
      default: Date.now,
      index: true
    },

    scheduledAt: {
      type: Date,
      default: null,
      index: true
    },

    errorMessage: {
      type: String,
      default: null
    },

    sentAt: {
      type: Date,
      default: null
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);


/**
 * Compound index for worker efficiency
 * Used in batch processing queries
 */
ticketNotificationSchema.index({
  status: 1,
  nextRetryAt: 1,
  priority: -1,
  createdAt: 1
});


ticketNotificationSchema.index({
  scheduledAt: 1,
  status: 1
});


const TicketNotification = mongoose.model(
  "TicketNotification",
  ticketNotificationSchema
);

module.exports = TicketNotification;