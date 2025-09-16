function errorMiddleware(err, req, res, next) {
  console.error(err.stack); // logs the error to the console
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
}

module.exports = errorMiddleware;
