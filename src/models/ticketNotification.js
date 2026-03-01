const mongoose = require("mongoose");

const ticketNotificationSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
      maxlength: 255,
    },

    content: {
      type: String,
      required: [true, "Content is required"],
      trim: true,
    },

    recipientEmail: {
      type: [String],
      required: [true, "Recipient email(s) required"],
      validate: {
        validator: function (emails) {
          return emails.every((email) =>
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
          );
        },
        message: "One or more recipient emails are invalid",
      },
    },

    status: {
      type: String,
      enum: {
        values: ["PENDING", "SENT", "FAILED"],
        message: "{VALUE} is not a valid notification status",
      },
      default: "PENDING",
      index: true, 
    },

    retries: {
      type: Number,
      default: 0,
      min: 0,
    },

    errorMessage: {
      type: String,
      default: null,
    },

    sentAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);


ticketNotificationSchema.index({ status: 1, createdAt: 1 });

const TicketNotification = mongoose.model(
  "TicketNotification",
  ticketNotificationSchema
);

module.exports = TicketNotification;