const mongoose = require("mongoose");
const Mood = require("../models/Mood");
const { dayBounds, daysAgoStart, parseDay } = require("../utils/time");
const {
  MAX_DAILY_MOODS, HISTORY_DAYS, INSIGHT_WINDOW_DAYS, MIN_TAG_ENTRIES,
} = require("../constants/moods");

const fail = (res, err, label) => {
  console.error(`${label} error:`, err);
  res.status(500).json({ success: false, message: "Server error" });
};

const round1 = (n) => Math.round(n * 10) / 10;

// ---------- create ----------
exports.addMood = async (req, res) => {
  try {
    const { rating, emotions, activities, note } = req.validated.body;
    const { start, end } = dayBounds(req.tz);

    const todayCount = await Mood.countDocuments({
      user: req.user.id,
      date: { $gte: start, $lt: end },
    });

    if (todayCount >= MAX_DAILY_MOODS) {
      return res.status(400).json({
        success: false,
        message: `Daily mood limit reached (${MAX_DAILY_MOODS} moods per day)`,
      });
    }

    const mood = await Mood.create({ user: req.user.id, rating, emotions, activities, note });

    res.status(201).json({
      success: true,
      mood,
      remainingToday: MAX_DAILY_MOODS - (todayCount + 1),
    });
  } catch (err) {
    fail(res, err, "Add mood");
  }
};

// ---------- dashboard data ----------
// recent = latest 10 (table), history = last 30 days (stats, streak, chart)
exports.getDashboard = async (req, res) => {
  try {
    const since = daysAgoStart(req.tz, HISTORY_DAYS - 1);

    const [recent, history] = await Promise.all([
      Mood.find({ user: req.user.id }).sort({ date: -1 }).limit(10).lean(),
      Mood.find({ user: req.user.id, date: { $gte: since } })
        .sort({ date: -1 })
        .select("rating date")
        .lean(),
    ]);

    res.json({ success: true, moods: recent, history });
  } catch (err) {
    fail(res, err, "Get dashboard");
  }
};

exports.getDailyCount = async (req, res) => {
  try {
    const { start, end } = dayBounds(req.tz);
    const count = await Mood.countDocuments({
      user: req.user.id,
      date: { $gte: start, $lt: end },
    });

    res.json({
      success: true,
      todayCount: count,
      remaining: Math.max(0, MAX_DAILY_MOODS - count),
    });
  } catch (err) {
    fail(res, err, "Get daily count");
  }
};

// ---------- history (paginated + filters) ----------
exports.listMoods = async (req, res) => {
  try {
    const { page, limit, from, to, rating, emotion, activity } = req.validated.query;
    const filter = { user: req.user.id };

    if (from || to) {
      filter.date = {};
      if (from) {
        const d = parseDay(from, req.tz);
        if (!d) return res.status(400).json({ success: false, message: "Invalid 'from' date" });
        filter.date.$gte = d.toJSDate();
      }
      if (to) {
        const d = parseDay(to, req.tz);
        if (!d) return res.status(400).json({ success: false, message: "Invalid 'to' date" });
        filter.date.$lt = d.plus({ days: 1 }).toJSDate(); // include the whole 'to' day
      }
    }
    if (rating) filter.rating = rating;
    if (emotion) filter.emotions = emotion;
    if (activity) filter.activities = activity;

    const [moods, total] = await Promise.all([
      Mood.find(filter)
        .sort({ date: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Mood.countDocuments(filter),
    ]);

    res.json({
      success: true,
      moods,
      pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
    });
  } catch (err) {
    fail(res, err, "List moods");
  }
};

// ---------- edit / delete ----------
exports.updateMood = async (req, res) => {
  try {
    const { id } = req.validated.params;
    // Filtering by user means you can only ever touch your own entries
    const mood = await Mood.findOneAndUpdate(
      { _id: id, user: req.user.id },
      { $set: req.validated.body },
      { new: true, runValidators: true }
    );
    if (!mood) return res.status(404).json({ success: false, message: "Mood entry not found" });
    res.json({ success: true, mood });
  } catch (err) {
    fail(res, err, "Update mood");
  }
};

exports.deleteMood = async (req, res) => {
  try {
    const { id } = req.validated.params;
    const mood = await Mood.findOneAndDelete({ _id: id, user: req.user.id });
    if (!mood) return res.status(404).json({ success: false, message: "Mood entry not found" });
    res.json({ success: true, message: "Mood entry deleted" });
  } catch (err) {
    fail(res, err, "Delete mood");
  }
};

// ---------- tag insights ----------
exports.getInsights = async (req, res) => {
  try {
    const match = {
      user: new mongoose.Types.ObjectId(req.user.id),
      date: { $gte: daysAgoStart(req.tz, INSIGHT_WINDOW_DAYS - 1) },
    };

    const perTag = (field) =>
      Mood.aggregate([
        { $match: match },
        { $unwind: `$${field}` },
        { $group: { _id: `$${field}`, count: { $sum: 1 }, avgRating: { $avg: "$rating" } } },
      ]);

    const [overallRows, emotionRows, activityRows] = await Promise.all([
      Mood.aggregate([
        { $match: match },
        { $group: { _id: null, avgRating: { $avg: "$rating" }, total: { $sum: 1 } } },
      ]),
      perTag("emotions"),
      perTag("activities"),
    ]);

    const overall = overallRows[0] || null;
    const overallAvg = overall ? overall.avgRating : null;

    // A tag only counts once it has enough entries, so one bad day can't skew it
    const shape = (rows) =>
      rows
        .filter((r) => r.count >= MIN_TAG_ENTRIES)
        .map((r) => ({
          tag: r._id,
          count: r.count,
          avgRating: round1(r.avgRating),
          diff: overallAvg === null ? 0 : round1(r.avgRating - overallAvg),
        }));

    const activities = shape(activityRows).sort((a, b) => b.diff - a.diff);

    res.json({
      success: true,
      windowDays: INSIGHT_WINDOW_DAYS,
      minEntries: MIN_TAG_ENTRIES,
      overall: {
        avgRating: overall ? round1(overall.avgRating) : null,
        totalEntries: overall ? overall.total : 0,
      },
      lifts: activities.filter((a) => a.diff >= 0.3).slice(0, 3),
      drags: activities.filter((a) => a.diff <= -0.3).sort((a, b) => a.diff - b.diff).slice(0, 3),
      activities,
      emotions: shape(emotionRows).sort((a, b) => b.count - a.count).slice(0, 5),
    });
  } catch (err) {
    fail(res, err, "Get insights");
  }
};
