const { z } = require("zod");
const {
  EMOTIONS, ACTIVITIES, MAX_TAGS_PER_GROUP, MAX_NOTE_LENGTH,
  RATING_MIN, RATING_MAX,
} = require("../constants/moods");

// ---------- auth ----------
const email = z
  .string({ required_error: "Email is required" })
  .trim()
  .toLowerCase()
  .email("Please enter a valid email address")
  .max(254, "Email is too long");

const signup = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .trim()
    .min(3, "Name must be at least 3 characters long")
    .max(50, "Name must be at most 50 characters"),
  email,
  password: z
    .string({ required_error: "Password is required" })
    .min(8, "Password must be at least 8 characters long")
    .max(72, "Password must be at most 72 characters"),
});

// Login stays lenient so accounts created with older rules can still sign in
const login = z.object({
  email: z.string({ required_error: "Email is required" }).trim().toLowerCase().min(1, "Email is required"),
  password: z.string({ required_error: "Password is required" }).min(1, "Password is required"),
});

// ---------- moods ----------
const tags = (values, label) =>
  z
    .array(z.enum(values, { errorMap: () => ({ message: `Unknown ${label} tag` }) }), {
      invalid_type_error: `${label} must be a list`,
    })
    .max(MAX_TAGS_PER_GROUP, `Choose at most ${MAX_TAGS_PER_GROUP} ${label}`)
    .refine((a) => new Set(a).size === a.length, `Duplicate ${label}`);

const fields = {
  rating: z
    .number({ required_error: "Please choose a rating", invalid_type_error: "Rating must be a number" })
    .int("Rating must be a whole number")
    .min(RATING_MIN, `Rating must be between ${RATING_MIN} and ${RATING_MAX}`)
    .max(RATING_MAX, `Rating must be between ${RATING_MIN} and ${RATING_MAX}`),
  emotions: tags(EMOTIONS, "emotions"),
  activities: tags(ACTIVITIES, "activities"),
  note: z.string({ invalid_type_error: "Note must be text" }).trim().max(MAX_NOTE_LENGTH, `Note must be at most ${MAX_NOTE_LENGTH} characters`),
};

const moodCreate = z.object({
  rating: fields.rating,
  emotions: fields.emotions.default([]),
  activities: fields.activities.default([]),
  note: fields.note.default(""),
});

// Only the fields that were sent are changed. user/date can never be edited.
const moodUpdate = z
  .object({
    rating: fields.rating.optional(),
    emotions: fields.emotions.optional(),
    activities: fields.activities.optional(),
    note: fields.note.optional(),
  })
  .refine((o) => Object.values(o).some((v) => v !== undefined), "Nothing to update");

const idParam = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, "Invalid mood id"),
});

const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Dates must look like YYYY-MM-DD");

const listQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  from: day.optional(),
  to: day.optional(),
  rating: z.coerce.number().int().min(RATING_MIN).max(RATING_MAX).optional(),
  emotion: z.enum(EMOTIONS).optional(),
  activity: z.enum(ACTIVITIES).optional(),
});

module.exports = { signup, login, moodCreate, moodUpdate, idParam, listQuery };
