import { useEffect, useState } from "react";
import { moodApi } from "../../services/api";
import { useNotification } from "../../context/NotificationContext";
import {
  ACTIVITIES, EMOTIONS, MAX_NOTE_LENGTH, ratingEmoji, ratingLabel,
} from "../../utils/mood";
import RatingPicker from "./RatingPicker";
import TagPicker from "./TagPicker";
import TagChips from "./TagChips";

/**
 * View / edit / delete one entry.
 * onChanged() is called after a successful edit or delete so the page can reload.
 */
export default function MoodDetailModal({ entry, onClose, onChanged }) {
  const { showNotification, showError } = useNotification();
  const [mode, setMode] = useState("view"); // view | edit | confirm-delete
  const [busy, setBusy] = useState(false);
  const [rating, setRating] = useState(entry.rating);
  const [emotions, setEmotions] = useState(entry.emotions || []);
  const [activities, setActivities] = useState(entry.activities || []);
  const [note, setNote] = useState(entry.note || "");

  // Esc closes; page behind doesn't scroll while the dialog is open
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && !busy && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [busy, onClose]);

  const when = new Date(entry.date).toLocaleString("en-US", {
    weekday: "long", month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  const save = async () => {
    setBusy(true);
    try {
      await moodApi.update(entry._id, { rating, emotions, activities, note });
      showNotification("Entry updated", "success");
      onChanged();
      onClose();
    } catch (err) {
      showError(err);
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await moodApi.remove(entry._id);
      showNotification("Entry deleted", "success");
      onChanged();
      onClose();
    } catch (err) {
      showError(err);
      setBusy(false);
    }
  };

  const btn = "px-5 py-2.5 rounded-2xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2";

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && !busy && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="entry-title"
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-gray-800/95 border border-gray-700/60 rounded-3xl shadow-2xl p-6 text-white animate-scale-in"
      >
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h2 id="entry-title" className="text-xl font-bold">
              {mode === "edit" ? "Edit entry" : "Mood entry"}
            </h2>
            <p className="text-sm text-gray-400">{when}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close"
            className="text-2xl leading-none text-gray-400 hover:text-white"
          >
            ×
          </button>
        </div>

        {mode === "edit" ? (
          <div className="space-y-5">
            <RatingPicker value={rating} onChange={setRating} disabled={busy} />
            <TagPicker title="Feelings" options={EMOTIONS} value={emotions} onChange={setEmotions} disabled={busy} />
            <TagPicker title="What was going on?" options={ACTIVITIES} value={activities} onChange={setActivities} disabled={busy} />
            <div>
              <label htmlFor="edit-note" className="block font-medium text-gray-200 mb-2">Note</label>
              <textarea
                id="edit-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                maxLength={MAX_NOTE_LENGTH}
                disabled={busy}
                className="w-full p-3 rounded-2xl bg-gray-700/50 border border-gray-600/50 text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
              <div className="text-xs text-gray-400 text-right">{note.length}/{MAX_NOTE_LENGTH}</div>
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" disabled={busy} onClick={() => setMode("view")} className={`${btn} bg-gray-700/60 hover:bg-gray-700 focus:ring-gray-500/50`}>
                Cancel
              </button>
              <button type="button" disabled={busy} onClick={save} className={`${btn} bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:ring-blue-500/50`}>
                {busy ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <span className="text-5xl" aria-hidden="true">{ratingEmoji(entry.rating)}</span>
              <div>
                <div className="text-2xl font-bold">{ratingLabel(entry.rating)}</div>
                <div className="text-sm text-gray-400">Rating {entry.rating} of 5</div>
              </div>
            </div>

            {(entry.emotions?.length > 0 || entry.activities?.length > 0) && (
              <div className="space-y-3">
                {entry.emotions?.length > 0 && (
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Feelings</div>
                    <TagChips tags={entry.emotions} />
                  </div>
                )}
                {entry.activities?.length > 0 && (
                  <div>
                    <div className="text-sm text-gray-400 mb-1">What was going on</div>
                    <TagChips tags={entry.activities} />
                  </div>
                )}
              </div>
            )}

            <div>
              <div className="text-sm text-gray-400 mb-1">Note</div>
              <p className="whitespace-pre-wrap break-words text-gray-100">
                {entry.note || <span className="text-gray-500">No note</span>}
              </p>
            </div>

            {mode === "confirm-delete" ? (
              <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/30">
                <p className="text-red-100 mb-3">Delete this entry? This can't be undone.</p>
                <div className="flex justify-end gap-3">
                  <button type="button" disabled={busy} onClick={() => setMode("view")} className={`${btn} bg-gray-700/60 hover:bg-gray-700 focus:ring-gray-500/50`}>
                    Keep it
                  </button>
                  <button type="button" disabled={busy} onClick={remove} className={`${btn} bg-red-600 hover:bg-red-700 focus:ring-red-500/50`}>
                    {busy ? "Deleting..." : "Yes, delete"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between gap-3">
                <button type="button" onClick={() => setMode("confirm-delete")} className={`${btn} bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-200 focus:ring-red-500/50`}>
                  Delete
                </button>
                <button type="button" onClick={() => setMode("edit")} className={`${btn} bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:ring-blue-500/50`}>
                  Edit
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
