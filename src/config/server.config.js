const dotenv = require("dotenv");
dotenv.config();

const requiredEnv = (key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return process.env[key];
};

const config = {
  app: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || "development",
  },

  mail: {
    user: requiredEnv("EMAIL_USER"),
    pass: requiredEnv("EMAIL_PASS"),
    from: process.env.EMAIL_FROM || requiredEnv("EMAIL_USER"),
  },

  db: {
    uri: requiredEnv("DB_URI"),
    name: process.env.DB_NAME || "notificationDB",
  },
};

module.exports = config;