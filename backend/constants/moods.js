// Single source of truth for rating/tag rules on the backend.
// The frontend keeps a matching copy in Frontend/src/utils/mood.js.
module.exports = {
  RATING_MIN: 1,
  RATING_MAX: 5,
  EMOTIONS: [
    "furious", "exhausted", "overwhelmed", "disappointed", "anxious",
    "amused", "joyful", "confident", "inspired", "ecstatic",
  ],
  ACTIVITIES: [
    "exercise", "good-sleep", "poor-sleep", "work",
    "study", "friends", "family", "outdoors",
  ],
  MAX_TAGS_PER_GROUP: 5,
  MAX_NOTE_LENGTH: 500,
  MAX_DAILY_MOODS: 10,
  HISTORY_DAYS: 30,        // days of entries sent to the dashboard
  INSIGHT_WINDOW_DAYS: 90, // days used for tag insights
  MIN_TAG_ENTRIES: 3,      // a tag needs this many entries before it shows in insights
};
