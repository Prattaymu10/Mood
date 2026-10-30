const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { getDbStatus, explain } = require("./config/db");
const timezone = require("./middleware/timezone");
const requireDb = require("./middleware/requireDb");
const { apiLimiter } = require("./middleware/rateLimiters");
const { notFound, errorHandler } = require("./middleware/errorHandler");

function createApp(config, { ensureDb } = {}) {
  const app = express();
  app.locals.config = config;

  // Behind Render's proxy: needed so rate limiting sees the real client IP
  if (config.trustProxy) app.set("trust proxy", 1);

  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(
    cors({
      origin(origin, cb) {
        // no Origin header (curl, same-origin) or no allow-list configured: allow
        if (!origin || !config.corsOrigins) return cb(null, true);
        cb(null, config.corsOrigins.includes(origin));
      },
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Timezone"],
    })
  );
  app.use(express.json({ limit: "10kb" }));

  // Normal server: the connection is kept alive in the background (requireDb just checks it).
  // Serverless (Vercel): connect on demand, reusing the connection while the instance is warm.
  const dbGuard = ensureDb
    ? async (req, res, next) => {
        try {
          await ensureDb();
          next();
        } catch (err) {
          res.status(503).json({
            success: false,
            code: "DB_UNAVAILABLE",
            message: "The server can't reach its database right now. Please try again in a moment.",
            problem: explain(err).title,
          });
        }
      }
    : requireDb;

  // Handy for checking the server from a browser (also used by hosting platforms)
  app.get("/", (req, res) => res.send("MoodTracker API is running. Try /api/health"));
  app.get("/api/health", async (req, res) => {
    if (ensureDb) await ensureDb().catch(() => {}); // report the real state, don't just say "disconnected"
    res.json({ success: true, status: "ok", db: getDbStatus(), time: new Date().toISOString() });
  });

  app.use("/api", apiLimiter, timezone);
  app.use("/api/auth", dbGuard, require("./routes/auth"));
  app.use("/api/moods", dbGuard, require("./routes/mood"));

  app.use(notFound);
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
