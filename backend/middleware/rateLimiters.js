const { rateLimit } = require("express-rate-limit");

const make = (opts) =>
  rateLimit({
    standardHeaders: true,
    legacyHeaders: false,
    ...opts,
    message: { success: false, code: "RATE_LIMITED", message: opts.message },
  });

// Only failed logins count, so normal use is never blocked
const loginLimiter = make({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  message: "Too many failed login attempts. Please wait 15 minutes and try again.",
});

const signupLimiter = make({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  message: "Too many sign-up attempts from this network. Please try again later.",
});

const apiLimiter = make({
  windowMs: 15 * 60 * 1000,
  limit: 600,
  message: "Too many requests. Please slow down.",
});

module.exports = { loginLimiter, signupLimiter, apiLimiter };
