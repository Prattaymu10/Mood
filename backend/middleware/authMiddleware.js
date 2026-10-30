const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ success: false, message: "Access denied", code: "NO_TOKEN" });
  }

  try {
    req.user = jwt.verify(token, req.app.locals.config.jwtSecret); // { id }
    next();
  } catch (err) {
    const expired = err.name === "TokenExpiredError";
    res.status(401).json({
      success: false,
      message: expired ? "Session expired" : "Invalid token",
      code: expired ? "TOKEN_EXPIRED" : "INVALID_TOKEN",
    });
  }
};

module.exports = authenticate;
