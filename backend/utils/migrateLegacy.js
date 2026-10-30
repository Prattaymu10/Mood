// Converts old entries (moodScore -5..+5 + emoji) to the new model
// (rating 1..5 + emotion tags). Safe to run many times.
const SCORE_MAP = {
  "-5": { rating: 1, emotion: "furious" },
  "-4": { rating: 1, emotion: "exhausted" },
  "-3": { rating: 2, emotion: "overwhelmed" },
  "-2": { rating: 2, emotion: "disappointed" },
  "-1": { rating: 3, emotion: "anxious" },
  "0": { rating: 3, emotion: null },
  "1": { rating: 3, emotion: "amused" },
  "2": { rating: 4, emotion: "joyful" },
  "3": { rating: 4, emotion: "confident" },
  "4": { rating: 5, emotion: "inspired" },
  "5": { rating: 5, emotion: "ecstatic" },
};

const legacyScoreToRating = (score) => SCORE_MAP[String(score)]?.rating ?? null;

async function migrateLegacyMoods(Mood) {
  const col = Mood.collection;
  const legacy = await col.findOne(
    { moodScore: { $exists: true }, rating: { $exists: false } },
    { projection: { _id: 1 } }
  );
  if (!legacy) return 0;

  let migrated = 0;
  for (const [score, { rating, emotion }] of Object.entries(SCORE_MAP)) {
    const res = await col.updateMany(
      { moodScore: Number(score), rating: { $exists: false } },
      {
        $set: { rating, emotions: emotion ? [emotion] : [], activities: [] },
        $unset: { moodScore: "", mood: "" },
      }
    );
    migrated += res.modifiedCount;
  }
  return migrated;
}

module.exports = { SCORE_MAP, legacyScoreToRating, migrateLegacyMoods };
