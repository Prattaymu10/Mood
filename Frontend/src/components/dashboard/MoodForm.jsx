import { useEffect, useRef, useState } from "react";
import { ACTIVITIES, EMOTIONS, MAX_NOTE_LENGTH } from "../../utils/mood";
import { useNotification } from "../../context/NotificationContext";
import RatingPicker from "../mood/RatingPicker";
import TagPicker from "../mood/TagPicker";

const FOCUS_GLOW =
  "absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 group-focus-within:from-blue-500/10 group-focus-within:via-purple-500/10 group-focus-within:to-pink-500/10 transition-all duration-500 pointer-events-none";

/**
 * onSave({ rating, emotions, activities, note }) -> Promise<boolean>  (true when saved)
 * limitReached disables the button like the original "Daily Goal Complete!" state.
 */
export default function MoodForm({ onSave, limitReached }) {
  const { showNotification } = useNotification();
  const [rating, setRating] = useState(null);
  const [emotions, setEmotions] = useState([]);
  const [activities, setActivities] = useState([]);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("idle"); // idle | saving | saved
  const resetTimer = useRef();

  useEffect(() => () => clearTimeout(resetTimer.current), []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === null) {
      showNotification("Please choose how you're feeling.", "error");
      return;
    }

    setStatus("saving");
    const ok = await onSave({ rating, emotions, activities, note });

    if (ok) {
      setRating(null);
      setEmotions([]);
      setActivities([]);
      setNote("");
      setStatus("saved");
      resetTimer.current = setTimeout(() => setStatus("idle"), 2000);
    } else {
      setStatus("idle");
    }
  };

  let content;
  if (status === "saving") {
    content = (<><span className="animate-spin mr-2">⭐</span>Saving...</>);
  } else if (limitReached) {
    content = (<><span className="mr-2">✅</span>Daily Goal Complete!</>);
  } else if (status === "saved") {
    content = (<><span className="mr-2">✅</span>Saved Successfully!</>);
  } else {
    content = (<><span className="mr-2" aria-hidden="true">✨</span>Save My Mood</>);
  }

  const busy = status === "saving";

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div>
        <div className="block font-medium text-lg mb-2" id="rating-label">How are you feeling?</div>
        <RatingPicker value={rating} onChange={setRating} disabled={busy} />
      </div>

      <TagPicker
        title="Which feelings fit?"
        options={EMOTIONS}
        value={emotions}
        onChange={setEmotions}
        disabled={busy}
      />

      <TagPicker
        title="What was going on?"
        options={ACTIVITIES}
        value={activities}
        onChange={setActivities}
        disabled={busy}
        hint="These help you spot what lifts or drags your mood."
      />

      <div>
        <label htmlFor="note" className="block font-medium text-lg mb-2">
          Tell us more about your day
        </label>
        <div className="relative group">
          <textarea
            id="note"
            name="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full p-4 rounded-2xl bg-gray-700/50 border border-gray-600/50 text-white placeholder-gray-400 backdrop-blur-md transition-all duration-300 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 hover:bg-gray-700/70 resize-none focus:outline-none"
            rows={3}
            placeholder="What made you feel this way? Any thoughts you'd like to track..."
            maxLength={MAX_NOTE_LENGTH}
            aria-describedby="note-description"
          />
          <div className={FOCUS_GLOW} />
        </div>
        <div id="note-description" className="text-xs text-gray-400 mt-1">
          Optional (max {MAX_NOTE_LENGTH} characters)
        </div>
      </div>

      <button
        type="submit"
        disabled={busy || limitReached}
        className={`w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${status === "saved" ? "animate-glow" : ""}`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
        <span className="relative z-10 flex items-center justify-center">{content}</span>
      </button>
    </form>
  );
}
