const dns = require("dns");
const mongoose = require("mongoose");

const STATES = ["disconnected", "connected", "connecting", "disconnecting"];
const status = { lastError: null, hint: null, attempts: 0 };

/** Turns raw driver errors into plain-language causes and fixes. */
function explain(err) {
  const msg = String((err && (err.message || err.reason)) || err);

  if (/bad auth|authentication failed|auth failed/i.test(msg)) {
    return {
      code: "AUTH",
      title: "MongoDB rejected the username or password.",
      steps: [
        "Atlas > Database Access: check the database user exists and note its exact username.",
        "Reset that user's password (letters and numbers only), then run: npm run setup",
        "Use the DATABASE user's password, not your Atlas website login password.",
      ],
    };
  }
  if (/querySrv|ENOTFOUND|EAI_AGAIN|getaddrinfo/i.test(msg)) {
    return {
      code: "DNS",
      title: "The cluster address could not be found (DNS problem).",
      steps: [
        "Check the cluster host in your connection string, e.g. cluster0.abcde.mongodb.net.",
        "Try another network (phone hotspot), or switch your DNS to 8.8.8.8 / 1.1.1.1.",
        "Turn off any VPN.",
      ],
    };
  }
  if (/tlsv1 alert|SSL alert|ssl3_read_bytes|ReplicaSetNoPrimary|selection timed out|ECONNREFUSED|ETIMEDOUT|MongoServerSelectionError|MongooseServerSelectionError/i.test(msg)) {
    return {
      code: "NETWORK",
      title: "Could not reach MongoDB from this computer (for Atlas this is usually the IP allow-list).",
      steps: [
        "Atlas > Security > Network Access > Add IP Address > Allow Access From Anywhere (0.0.0.0/0) > Confirm.",
        "Wait until that row says Active (1-2 minutes), then try again.",
        "Atlas > Database: make sure the cluster is not Paused (click Resume if it is).",
        "Turn off any VPN, or try a phone hotspot (some ISPs block MongoDB's port 27017).",
        "Using a local MongoDB instead? Make sure the mongod service is running.",
      ],
    };
  }
  return { code: "UNKNOWN", title: "Could not connect to MongoDB.", steps: ["Run: npm run check-db  and read its output."] };
}

const isSrvDnsError = (err) => /querySrv|ECONNREFUSED.*_mongodb|ESERVFAIL/i.test(String(err && err.message));

function connectOptions(config, extra = {}) {
  const opts = { serverSelectionTimeoutMS: 8000, connectTimeoutMS: 8000, ...extra };
  if (!config.uriHasDbName) opts.dbName = config.dbName;
  return opts;
}

async function connectOnce(config, extra = {}) {
  await mongoose.disconnect().catch(() => {});
  await mongoose.connect(config.mongoUri, connectOptions(config, extra));
}

function formatHint(info) {
  return [`   ${info.title}`, ...info.steps.map((s, i) => `   ${i + 1}. ${s}`)].join("\n");
}

/**
 * Connects in the background and keeps retrying, so the API never just dies.
 * While disconnected the API answers 503 with a clear message (see requireDb).
 */
function startDbConnection(config, { onConnected, log = console } = {}) {
  let timer;
  let stopped = false;
  let dnsFallbackTried = false;
  let everConnected = false;

  mongoose.connection.on("disconnected", () => {
    if (!stopped && everConnected) log.warn("⚠️  MongoDB connection lost. The driver will keep trying to reconnect...");
  });
  mongoose.connection.on("reconnected", () => log.log("✅ MongoDB reconnected."));

  async function attempt() {
    if (stopped) return;
    status.attempts += 1;
    try {
      await connectOnce(config);
      status.lastError = null;
      status.hint = null;
      everConnected = true;
      log.log(`✅ MongoDB connected (database: ${config.dbName})`);
      if (onConnected) await onConnected();
    } catch (err) {
      if (!dnsFallbackTried && isSrvDnsError(err)) {
        dnsFallbackTried = true;
        dns.setServers(["8.8.8.8", "1.1.1.1"]);
        log.warn("⚠️  DNS lookup failed. Retrying with public DNS (8.8.8.8 / 1.1.1.1)...");
        return attempt();
      }
      const info = explain(err);
      status.lastError = String(err.message).split("\n")[0].slice(0, 300);
      status.hint = info;

      if (status.attempts === 1 || status.attempts % 5 === 0) {
        log.error(`\n❌ MongoDB connection failed (attempt ${status.attempts}).\n${formatHint(info)}\n   The server stays up and keeps retrying. Run "npm run check-db" for a full diagnosis.\n`);
      } else {
        log.error(`❌ Still can't reach MongoDB (attempt ${status.attempts}): ${info.title}`);
      }
      timer = setTimeout(attempt, Math.min(3000 * status.attempts, 20000));
    }
  }

  attempt();
  return {
    stop() {
      stopped = true;
      clearTimeout(timer);
      return mongoose.disconnect().catch(() => {});
    },
  };
}

/**
 * For serverless hosting (Vercel): returns an async function that makes sure the
 * database is connected, reusing the connection between requests that hit the same
 * warm instance. Many requests at once share one attempt, and a failed attempt is
 * never remembered, so the next request simply tries again.
 */
function createEnsureDb(config, { onConnected, log = console } = {}) {
  let pending = null;
  let dnsFallbackTried = false;

  async function connect() {
    try {
      await connectOnce(config, { maxPoolSize: 5 }); // few connections per instance (Atlas free tier limit)
    } catch (err) {
      if (!dnsFallbackTried && isSrvDnsError(err)) {
        dnsFallbackTried = true;
        dns.setServers(["8.8.8.8", "1.1.1.1"]);
        await connectOnce(config, { maxPoolSize: 5 });
      } else {
        throw err;
      }
    }
    status.attempts += 1;
    status.lastError = null;
    status.hint = null;
    log.log(`MongoDB connected (database: ${config.dbName})`);
    if (onConnected) await onConnected();
  }

  return async function ensureDb() {
    if (mongoose.connection.readyState === 1) return;
    if (!pending) {
      pending = connect()
        .catch((err) => {
          const info = explain(err);
          status.attempts += 1;
          status.lastError = String(err.message).split("\n")[0].slice(0, 300);
          status.hint = info;
          log.error(`MongoDB connection failed: ${info.title} (${status.lastError})`);
          throw err;
        })
        .finally(() => {
          pending = null; // never cache a failure
        });
    }
    return pending;
  };
}

function getDbStatus() {
  return {
    state: STATES[mongoose.connection.readyState] || "unknown",
    connected: mongoose.connection.readyState === 1,
    attempts: status.attempts,
    lastError: status.lastError,
    problem: status.hint ? status.hint.title : null,
  };
}

module.exports = { startDbConnection, createEnsureDb, connectOnce, getDbStatus, explain, isSrvDnsError };
