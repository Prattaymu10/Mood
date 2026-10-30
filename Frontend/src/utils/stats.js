// Pure functions behind the dashboard numbers (rating scale 1-5).
import { nearestRating } from "./mood";

const sameDay = (a, b) => a.toDateString() === b.toDateString();

const average = (list) => list.reduce((sum, m) => sum + m.rating, 0) / list.length;

/** Consecutive days with at least one entry (today may still be empty). */
export function calculateStreak(moods) {
  const today = new Date();
  let streak = 0;

  for (let i = 0; i < 30; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);

    const hasEntry = moods.some((m) => sameDay(new Date(m.date), checkDate));

    if (hasEntry) streak++;
    else if (i > 0) break;
  }

  return streak;
}

/** Day (last 7 days) with the highest average rating. */
export function findBestMoodDay(moods) {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const thisWeek = moods.filter((m) => new Date(m.date) >= weekAgo);
  if (thisWeek.length === 0) return "No data";

  const byDay = new Map();
  thisWeek.forEach((m) => {
    const d = new Date(m.date);
    const key = d.toDateString();
    if (!byDay.has(key)) byDay.set(key, { date: d, ratings: [] });
    byDay.get(key).ratings.push(m.rating);
  });

  let best = null;
  let highest = -Infinity;
  byDay.forEach(({ date, ratings }) => {
    const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
    if (avg > highest) {
      highest = avg;
      best = date;
    }
  });

  return best
    ? best.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
    : "No data";
}

const TREND_STABLE = { label: "Stable", className: "text-2xl font-bold text-blue-300" };
const TREND_STEP = 0.3; // on a 1-5 scale

/** Compares the newest 7 entries with the 7 before them (newest-first input). */
export function calculateTrend(moods) {
  if (moods.length < 7) return TREND_STABLE;

  const recent = moods.slice(0, 7);
  const older = moods.slice(7, 14);
  if (older.length === 0) return TREND_STABLE;

  const diff = average(recent) - average(older);

  if (diff > TREND_STEP) {
    return { label: "Improving", className: "text-2xl font-bold text-green-300" };
  }
  if (diff < -TREND_STEP) {
    return { label: "Declining", className: "text-2xl font-bold text-red-300" };
  }
  return TREND_STABLE;
}

/**
 * @param {Array} history last 30 days, newest first (from the API)
 * Avg Mood / Entries cover the last 7 days (same window as the chart);
 * streak, trend and best day use the full history.
 */
export function computeStats(history) {
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 6);
  weekStart.setHours(0, 0, 0, 0);
  const week = history.filter((m) => new Date(m.date) >= weekStart);

  const avg = week.length ? average(week) : null;
  const streak = calculateStreak(history);

  return {
    avgMood: avg === null ? "--" : avg.toFixed(1),
    avgLabel: avg === null ? "" : nearestRating(avg).label,
    totalEntries: String(week.length),
    streak: `${streak} ${streak === 1 ? "day" : "days"}`,
    bestDay: findBestMoodDay(history),
    trend: calculateTrend(history),
  };
}

/** Labels + average rating per day for the last 7 days (null = no entries). */
export function buildChartData(moods) {
  const today = new Date();
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d);
  }

  const values = days.map((day) => {
    const dayMoods = moods.filter((m) => sameDay(new Date(m.date), day));
    if (dayMoods.length === 0) return null;
    return Math.round(average(dayMoods) * 10) / 10;
  });

  const labels = days.map((d) =>
    d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
  );

  return { labels, values };
}
