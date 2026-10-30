// Keep in sync with backend/constants/moods.js

export const MAX_DAILY_MOODS = 10;
export const MAX_TAGS_PER_GROUP = 5;
export const MAX_NOTE_LENGTH = 500;

// The rating is the only number used for averages and charts.
// `active` = classes for the selected face (full strings so Tailwind keeps them).
export const RATINGS = [
  { value: 1, emoji: "😞", label: "Very bad", active: "bg-red-500/20 border-red-400/60 text-red-100" },
  { value: 2, emoji: "🙁", label: "Bad", active: "bg-orange-500/20 border-orange-400/60 text-orange-100" },
  { value: 3, emoji: "😐", label: "Okay", active: "bg-yellow-500/20 border-yellow-400/60 text-yellow-100" },
  { value: 4, emoji: "🙂", label: "Good", active: "bg-lime-500/20 border-lime-400/60 text-lime-100" },
  { value: 5, emoji: "😄", label: "Great", active: "bg-green-500/20 border-green-400/60 text-green-100" },
];

export const EMOTIONS = [
  { key: "furious", label: "Furious", emoji: "😡" },
  { key: "exhausted", label: "Exhausted", emoji: "😩" },
  { key: "overwhelmed", label: "Overwhelmed", emoji: "😭" },
  { key: "disappointed", label: "Disappointed", emoji: "😔" },
  { key: "anxious", label: "Anxious", emoji: "😬" },
  { key: "amused", label: "Amused", emoji: "😂" },
  { key: "joyful", label: "Joyful", emoji: "😄" },
  { key: "confident", label: "Confident", emoji: "😎" },
  { key: "inspired", label: "Inspired", emoji: "🤩" },
  { key: "ecstatic", label: "Ecstatic", emoji: "🤗" },
];

export const ACTIVITIES = [
  { key: "exercise", label: "Exercise", emoji: "🏃" },
  { key: "good-sleep", label: "Good sleep", emoji: "😴" },
  { key: "poor-sleep", label: "Poor sleep", emoji: "🥱" },
  { key: "work", label: "Work", emoji: "💼" },
  { key: "study", label: "Study", emoji: "📚" },
  { key: "friends", label: "Friends", emoji: "🧑‍🤝‍🧑" },
  { key: "family", label: "Family", emoji: "👨‍👩‍👧" },
  { key: "outdoors", label: "Outdoors", emoji: "🌳" },
];

const TAGS = Object.fromEntries([...EMOTIONS, ...ACTIVITIES].map((t) => [t.key, t]));

export const tagLabel = (key) => TAGS[key]?.label ?? key;
export const tagEmoji = (key) => TAGS[key]?.emoji ?? "🏷️";

export const getRating = (value) => RATINGS.find((r) => r.value === Number(value)) ?? null;
export const ratingEmoji = (value) => getRating(value)?.emoji ?? "😐";
export const ratingLabel = (value) => getRating(value)?.label ?? "Unknown";

/** For averages like 3.4 -> the closest named rating ("Okay"). */
export const nearestRating = (avg) => {
  const i = Math.min(5, Math.max(1, Math.round(avg)));
  return RATINGS[i - 1];
};

export const formatDiff = (n) => (n > 0 ? `+${n.toFixed(1)}` : n.toFixed(1));

export const TIPS = [
  "Take 10 deep breaths and feel your body relax with each exhale.",
  "Drink a full glass of water and notice how refreshed you feel.",
  "Step outside for 5 minutes and soak in some natural light.",
  "Write down 3 specific things you're grateful for right now.",
  "Do 10 jumping jacks or stretch your arms above your head.",
  "Tidy up a small area around you for an instant mood boost.",
  "Listen to your favorite uplifting song and let yourself dance.",
  "Call or text someone you care about just to say hello.",
  "Look in the mirror and give yourself a genuine compliment.",
  "Take a moment to notice something beautiful in your surroundings.",
  "Practice the 5-4-3-2-1 grounding technique with your senses.",
  "Smile for 30 seconds - your brain will think you're happier!",
  "Do something kind for someone else, even if it's small.",
  "Spend 2 minutes focusing only on your breathing.",
  "Read an inspiring quote or watch a motivational video.",
];

export const getRandomTip = () => TIPS[Math.floor(Math.random() * TIPS.length)];
