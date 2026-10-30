const { DateTime, IANAZone } = require("luxon");

/** Falls back to UTC when the client sends a missing/invalid timezone. */
const resolveZone = (tz) => (tz && IANAZone.isValidZone(tz) ? tz : "UTC");

/** Start (inclusive) and end (exclusive) of "today" in the user's timezone. */
function dayBounds(tz, now = DateTime.now()) {
  const start = now.setZone(resolveZone(tz)).startOf("day");
  return { start: start.toJSDate(), end: start.plus({ days: 1 }).toJSDate() };
}

/** Start of the day `n` days ago in the user's timezone (0 = today). */
function daysAgoStart(tz, n, now = DateTime.now()) {
  return now.setZone(resolveZone(tz)).startOf("day").minus({ days: n }).toJSDate();
}

/** Parses "YYYY-MM-DD" as a day in the user's timezone; null if invalid. */
function parseDay(str, tz) {
  const dt = DateTime.fromISO(str, { zone: resolveZone(tz) });
  return dt.isValid ? dt.startOf("day") : null;
}

module.exports = { resolveZone, dayBounds, daysAgoStart, parseDay };
