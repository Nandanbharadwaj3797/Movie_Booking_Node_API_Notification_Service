const { STATUS } = require('../utils/constants');

const errorHandler = (err, req, res, next) => {

    console.error("Error:", err);

    let statusCode = STATUS.INTERNAL_SERVER_ERROR;

    // Only allow valid HTTP status codes
    if (err.code && err.code >= 100 && err.code < 600) {
        statusCode = err.code;
    }

    return res.status(statusCode).json({
        success: false,
        err: {},
        data: {},
        message: err.message || "Something went wrong"
    });
};

module.exports = errorHandler;