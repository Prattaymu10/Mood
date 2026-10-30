const { resolveZone } = require("../utils/time");

// The frontend sends the browser's IANA timezone (e.g. "Asia/Dhaka") so that
// "today" and the daily limit follow the user's day, not the server's (UTC).
module.exports = (req, res, next) => {
  req.tz = resolveZone(req.headers["x-timezone"]);
  next();
};
