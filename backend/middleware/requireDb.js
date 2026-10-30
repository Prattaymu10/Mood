const mongoose = require("mongoose");

// While MongoDB is unreachable, answer clearly instead of letting requests hang.
module.exports = (req, res, next) => {
  if (mongoose.connection.readyState === 1) return next();
  res.status(503).json({
    success: false,
    code: "DB_UNAVAILABLE",
    message: "The server can't reach its database right now. Please try again in a moment.",
  });
};
