const mongoose = require("mongoose");
const {
  RATING_MIN, RATING_MAX, EMOTIONS, ACTIVITIES, MAX_NOTE_LENGTH,
} = require("../constants/moods");

const moodSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  // 1 (very bad) .. 5 (great): the only number used for averages and charts
  rating: { type: Number, required: true, min: RATING_MIN, max: RATING_MAX },
  // Optional labels. They describe the day but never affect any maths.
  emotions: { type: [{ type: String, enum: EMOTIONS }], default: [] },
  activities: { type: [{ type: String, enum: ACTIVITIES }], default: [] },
  note: { type: String, trim: true, maxlength: MAX_NOTE_LENGTH, default: "" },
  date: { type: Date, default: Date.now },
});

// Every query filters by user and sorts/filters by date
moodSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model("Mood", moodSchema);
