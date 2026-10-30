import { ratingEmoji, ratingLabel } from "../../utils/mood";
import TagChips from "../mood/TagChips";

/** Used by the dashboard (10 recent) and the history page. onSelect(entry) opens the detail dialog. */
export default function MoodTable({
  moods,
  onSelect,
  title = "Recent Entries",
  emptyText = "No mood entries yet. Start tracking your mood today!",
  loading = false,
}) {
  return (
    <div className="space-y-4">
      {title && (
        <h3 className="text-xl font-semibold text-gray-200 flex items-center">
          <span className="mr-2" aria-hidden="true">📝</span>
          {title}
        </h3>
      )}

      <div className={`overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm transition-opacity duration-300 ${loading ? "opacity-60" : ""}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left" aria-label="Mood entries" aria-busy={loading}>
            <thead>
              <tr className="border-b border-gray-700/50 bg-white/5">
                <th scope="col" className="p-4 font-medium text-gray-300">Date & Time</th>
                <th scope="col" className="p-4 font-medium text-gray-300">Mood</th>
                <th scope="col" className="p-4 font-medium text-gray-300">Note</th>
                <th scope="col" className="p-4 font-medium text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/30">
              {moods.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-400">
                    <div className="text-4xl mb-2">📊</div>
                    <div>{loading ? "Loading..." : emptyText}</div>
                  </td>
                </tr>
              ) : (
                moods.map((entry, index) => {
                  const date = new Date(entry.date);
                  const tags = [...(entry.emotions || []), ...(entry.activities || [])];
                  return (
                    <tr
                      key={entry._id || index}
                      className="hover:bg-white/5 transition-colors duration-300 animate-fadeIn"
                      style={{ animationDelay: `${Math.min(index, 10) * 0.05}s`, animationFillMode: "both" }}
                    >
                      <td className="p-4 whitespace-nowrap">
                        <div className="font-medium">
                          {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </div>
                        <div className="text-sm text-gray-400">
                          {date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl" aria-hidden="true">{ratingEmoji(entry.rating)}</span>
                          <div>
                            <div className="text-sm font-medium">{ratingLabel(entry.rating)}</div>
                            <TagChips tags={tags} compact />
                          </div>
                        </div>
                      </td>
                      <td className="p-4 max-w-xs">
                        <div className="truncate" title={entry.note || ""}>
                          {entry.note || "—"}
                        </div>
                      </td>
                      <td className="p-4">
                        <button
                          type="button"
                          onClick={() => onSelect?.(entry)}
                          className="text-blue-400 hover:text-blue-300 text-sm underline transition-colors"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
