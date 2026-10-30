const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const dotenv = require("dotenv");

const ROOT = path.join(__dirname, "..");
// ENV_FILE lets tests (or you) point at a different file
const envPath = () => (process.env.ENV_FILE ? path.resolve(process.env.ENV_FILE) : path.join(ROOT, ".env"));

class ConfigError extends Error {
  constructor(message, fix = []) {
    super(message);
    this.name = "ConfigError";
    this.fix = fix;
  }
}

/**
 * Reads backend/.env ourselves (instead of dotenv.config) so we can catch the
 * mistakes that cause "injecting env (0)": wrong file name, empty file, UTF-16.
 * Always resolves the path from this file, so it works from any folder.
 */
function loadEnvFile() {
  const ENV_PATH = envPath();
  if (!fs.existsSync(ENV_PATH)) {
    for (const wrong of [".env.txt", ".env.example.txt"]) {
      if (fs.existsSync(path.join(ROOT, wrong))) {
        throw new ConfigError(`Found "${wrong}" but the file must be named exactly ".env".`, [
          `Rename it: ren ${wrong} .env      (Windows CMD)`,
          "Or just run: npm run setup",
        ]);
      }
    }
    return { found: false, keys: 0 };
  }

  const buf = fs.readFileSync(ENV_PATH);
  const utf16 = (buf[0] === 0xff && buf[1] === 0xfe) || (buf[0] === 0xfe && buf[1] === 0xff) || buf.includes(0);
  if (utf16) {
    throw new ConfigError(".env is saved in UTF-16, which can't be read (typical after `echo ... > .env` in PowerShell).", [
      "Run: npm run setup     (it rewrites .env correctly)",
    ]);
  }

  const parsed = dotenv.parse(buf.toString("utf8").replace(/^\uFEFF/, ""));
  let keys = 0;
  for (const [k, v] of Object.entries(parsed)) {
    keys++;
    if (process.env[k] === undefined || process.env[k] === "") process.env[k] = v;
  }
  if (keys === 0) {
    throw new ConfigError(".env exists but is empty (did you forget to press Ctrl+S?).", [
      "Run: npm run setup     (it fills .env in for you)",
    ]);
  }
  return { found: true, keys };
}

const strip = (v) => String(v).trim().replace(/^["']+|["']+$/g, "").trim();

function pick(...names) {
  for (const name of names) {
    const v = process.env[name];
    if (v && strip(v)) return { name, value: strip(v) };
  }
  return null;
}

const maskUri = (uri) => uri.replace(/(\/\/[^:/@]+:)([^@]*)(@)/, "$1****$3");

function readMongoUri() {
  // Accept the names people commonly use, so a name mismatch can't break startup.
  const found = pick("MONGO_URI", "MONGODB_URI", "MONGODB_URL", "MONGO_URL", "DATABASE_URL");
  if (!found) {
    throw new ConfigError("No MongoDB connection string found (MONGO_URI is missing).", [
      "Run: npm run setup     (asks for your Atlas connection string and writes .env)",
      "Or add this line to backend/.env:  MONGO_URI=mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/moodtracker",
    ]);
  }
  const uri = found.value;

  if (/<[^>]*>/.test(uri)) {
    throw new ConfigError(`${found.name} still contains a <placeholder> such as <db_password>.`, [
      "Replace the whole <...> part (including the < and > signs) with your real password.",
      "Or run: npm run setup",
    ]);
  }
  if (!/^mongodb(\+srv)?:\/\//i.test(uri)) {
    throw new ConfigError(`${found.name} must start with mongodb:// or mongodb+srv://`, [
      "Copy the string from Atlas: Database > Connect > Drivers.",
    ]);
  }
  const authority = uri.replace(/^mongodb(\+srv)?:\/\//i, "").split(/[/?]/)[0];
  if ((authority.match(/@/g) || []).length > 1) {
    throw new ConfigError("The password in the connection string contains a special character (like @ or #).", [
      "Run: npm run setup     (it encodes the password safely)",
      "Or change the Atlas user's password to letters and numbers only.",
    ]);
  }
  return { name: found.name, uri };
}

function dbNameFrom(uri) {
  const m = uri.match(/^mongodb(?:\+srv)?:\/\/[^/]+\/([^/?]+)/i);
  return m ? decodeURIComponent(m[1]) : null;
}

function loadConfig() {
  const envFile = loadEnvFile();
  const warnings = [];

  const isProd =
    process.env.NODE_ENV === "production" || !!process.env.RENDER || !!process.env.VERCEL;

  const { name: uriName, uri } = readMongoUri();

  let jwtSecret = pick("JWT_SECRET")?.value;
  if (!jwtSecret) {
    if (isProd) {
      throw new ConfigError("JWT_SECRET is missing.", [
        "Add a JWT_SECRET environment variable (at least 16 random characters).",
      ]);
    }
    jwtSecret = crypto.randomBytes(32).toString("hex");
    warnings.push("JWT_SECRET is not set, so a temporary one was generated. You'll be logged out whenever the server restarts. Run `npm run setup` to fix this.");
  } else if (isProd && jwtSecret.length < 16) {
    throw new ConfigError("JWT_SECRET is too short for production.", ["Use at least 16 random characters."]);
  }

  const origins = pick("CORS_ORIGINS")?.value;
  const corsOrigins = origins
    ? origins.split(",").map((o) => o.trim().replace(/\/+$/, "")).filter(Boolean)
    : null;
  if (!corsOrigins && isProd) {
    warnings.push("CORS_ORIGINS is not set, so any website can call this API. Set it to your frontend URL, e.g. https://yourapp.vercel.app");
  }

  return {
    isProd,
    port: Number(process.env.PORT) || 5000,
    mongoUri: uri,
    mongoUriName: uriName,
    maskedUri: maskUri(uri),
    dbName: dbNameFrom(uri) || pick("DB_NAME")?.value || "moodtracker",
    uriHasDbName: !!dbNameFrom(uri),
    jwtSecret,
    jwtExpiresIn: "1d",
    corsOrigins,
    trustProxy: isProd,
    warnings,
    envFile,
  };
}

function formatConfigError(err) {
  if (!(err instanceof ConfigError)) return `\n❌ Startup error: ${err.stack || err}\n`;
  const lines = ["", `❌ ${err.message}`, ""];
  if (err.fix.length) {
    lines.push("How to fix:");
    err.fix.forEach((f, i) => lines.push(`  ${i + 1}. ${f}`));
    lines.push("");
  }
  return lines.join("\n");
}

module.exports = { loadConfig, formatConfigError, ConfigError, maskUri, envPath };
