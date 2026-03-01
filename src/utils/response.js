const sendSuccess = (res, {
  statusCode = 200,
  data = {},
  message = "Request successful"
} = {}) => {
  return res.status(statusCode).json({
    success: true,
    data,
    err: null,
    message
  });
};

const sendError = (res, {
  statusCode = 500,
  error = {},
  message = "Something went wrong"
} = {}) => {
  return res.status(statusCode).json({
    success: false,
    data: null,
    err: error,
    message
  });
};

module.exports = {
  sendSuccess,
  sendError
};