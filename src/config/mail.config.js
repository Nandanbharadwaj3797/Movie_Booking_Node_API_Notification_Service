const nodemailer = require("nodemailer");
const config = require("./server.config");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for 587
  auth: {
    user: config.mail.user,
    pass: config.mail.pass,
  },
  pool: true, // Enable connection pooling
  maxConnections: 5,
  maxMessages: 100,
  tls: {
    rejectUnauthorized: false,
  },
});

// Verify connection at startup
transporter.verify((error) => {
  if (error) {
    console.error("Mail server connection failed:", error);
  } else {
    console.log("Mail server ready to send emails");
  }
});

module.exports = transporter;