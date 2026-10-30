// Entry point for Vercel: every request is rewritten to this function (see vercel.json).
// Locally you keep using `npm start` (server.js); this file is only used on Vercel.
const { loadConfig, formatConfigError } = require("../config/env");
const { createApp } = require("../app");
const { createEnsureDb } = require("../config/db");
const Mood = require("../models/Mood");
const { migrateLegacyMoods } = require("../utils/migrateLegacy");

let app;
try {
  const config = loadConfig();
  const ensureDb = createEnsureDb(config, {
    // converts entries from the old -5..+5 scale (one cheap query when there are none)
    onConnected: async () => {
      try {
        const n = await migrateLegacyMoods(Mood);
        if (n > 0) console.log(`Converted ${n} old mood entries to the new 1-5 rating.`);
      } catch (err) {
        console.error("Legacy migration failed (the app still works):", err.message);
      }
    },
  });
  app = createApp(config, { ensureDb });
} catch (err) {
  // A missing/invalid environment variable: say so, instead of Vercel's generic crash page.
  console.error(formatConfigError(err));
  app = (req, res) => {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        success: false,
        code: "CONFIG_ERROR",
        message: `The server is not configured correctly: ${err.message}`,
      })
    );
  };
}

module.exports = app;
