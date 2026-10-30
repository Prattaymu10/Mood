const { loadConfig, formatConfigError } = require("./config/env");
const { startDbConnection } = require("./config/db");
const { createApp } = require("./app");

let config;
try {
  config = loadConfig();
} catch (err) {
  console.error(formatConfigError(err));
  process.exit(1);
}

const Mood = require("./models/Mood");
const { migrateLegacyMoods } = require("./utils/migrateLegacy");

const app = createApp(config);

let listenErrorShown = false;
const onListenError = (err) => {
  if (listenErrorShown) return;
  listenErrorShown = true;
  if (err.code === "EADDRINUSE") {
    console.error(`\n❌ Port ${config.port} is already in use (is the server already running in another terminal?).`);
    console.error(`   Close the other one, or set a different PORT in backend/.env\n`);
  } else {
    console.error(err);
  }
  process.exit(1);
};

// Express 5 also passes listen errors to this callback, so handle them first
const server = app.listen(config.port, (err) => {
  if (err) return onListenError(err);
  console.log(`\n🚀 API listening on http://localhost:${config.port}`);
  console.log(`   Health check: http://localhost:${config.port}/api/health`);
  console.log(`⏳ Connecting to MongoDB: ${config.maskedUri}`);
  config.warnings.forEach((w) => console.warn(`⚠️  ${w}`));
});
server.on("error", onListenError);

const db = startDbConnection(config, {
  // Convert entries saved with the old -5..+5 scale (does nothing if there are none)
  onConnected: async () => {
    try {
      const n = await migrateLegacyMoods(Mood);
      if (n > 0) console.log(`🔄 Converted ${n} old mood entries to the new 1-5 rating.`);
    } catch (err) {
      console.error("Legacy migration failed (the app still works):", err.message);
    }
  },
});

const shutdown = async () => {
  console.log("\nShutting down...");
  await db.stop();
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 3000).unref();
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
process.on("unhandledRejection", (err) => console.error("Unhandled rejection:", err));
