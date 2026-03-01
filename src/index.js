const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const ticketRoutes = require('./routes/ticket.routes');
const { startNotificationCron } = require('./crons/notification.cron');

const app = express();

dotenv.config();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/notiservice/api/v1/notifications', ticketRoutes);

async function startServer() {
    try {
        await mongoose.connect(process.env.DB_URI, {
            dbName: process.env.DB_NAME
        });

        console.log("MongoDB connected successfully");

        // Start the notification cron job
        startNotificationCron();

        app.listen(process.env.PORT, () => {
            console.log(` Server is running on port ${process.env.PORT}`);
        });

    } catch (error) {
        console.error('Error starting the server:', error);
        process.exit(1);
    }
}

startServer();