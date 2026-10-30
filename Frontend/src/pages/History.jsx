import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import BackgroundBlobs from "../components/common/BackgroundBlobs";
import AppHeader from "../components/common/AppHeader";
import MoodTable from "../components/dashboard/MoodTable";
import MoodDetailModal from "../components/mood/MoodDetailModal";
import { moodApi } from "../services/api";
import { clearAuth, getUser } from "../utils/auth";
import { ACTIVITIES, EMOTIONS, RATINGS } from "../utils/mood";
import { useNotification } from "../context/NotificationContext";

const PAGE_SIZE = 10;
const NO_FILTERS = { from: "", to: "", rating: "", emotion: "", activity: "" };

const field =
  "w-full p-3 rounded-2xl bg-gray-700/50 border border-gray-600/50 text-white backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-blue-500/50 hover:bg-gray-700/70 transition-all duration-300";

export default function History() {
  const navigate = useNavigate();
  const { showNotification, showError } = useNotification();
  const user = useMemo(() => getUser(), []);
  const logoutTimer = useRef();

  const [filters, setFilters] = useState(NO_FILTERS);
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [result, setResult] = useState({ moods: [], pagination: { page: 1, total: 0, totalPages: 1 } });
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    document.title = "Mood History";
    return () => clearTimeout(logoutTimer.current);
  }, []);

  // Fetch whenever filters / page change (or after an edit/delete)
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    moodApi
      .list({ ...filters, page, limit: PAGE_SIZE })
      .then((data) => {
        if (cancelled) return;
        // deleted the last entry on the last page: step back
        if (data.moods.length === 0 && page > 1) setPage((p) => p - 1);
        else setResult(data);
      })
      .catch((err) => !cancelled && showError(err))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [filters, page, reloadKey, showError]);

  const setFilter = (name) => (e) => {
    setFilters((f) => ({ ...f, [name]: e.target.value }));
    setPage(1);
  };
  const clearFilters = () => {
    setFilters(NO_FILTERS);
    setPage(1);
  };
  const hasFilters = Object.values(filters).some(Boolean);
  const rangeBackwards = filters.from && filters.to && filters.from > filters.to;

  const handleLogout = () => {
    clearAuth();
    showNotification("Logged out successfully", "success");
    logoutTimer.current = setTimeout(() => navigate("/login"), 1000);
  };

  const { total, totalPages } = result.pagination;

  return (
    <div className="min-h-screen px-4 pt-6 pb-10 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white transition-all duration-1000">
      <BackgroundBlobs animationClass="animate-float" />

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        <AppHeader title="Mood History" userName={user?.name} onLogout={handleLogout} />

        <section
          className="bg-gray-800/30 backdrop-blur-xl border border-gray-700/50 p-8 rounded-3xl shadow-2xl animate-slideInLeft relative overflow-hidden"
          aria-labelledby="history-title"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl opacity-50" />

          <div className="relative z-10 space-y-6">
            <div>
              <h2 id="history-title" className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-1">
                All Entries
              </h2>
              <p className="text-gray-400">Filter by date, rating or tag. Select "View" to edit or delete an entry.</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4" role="search" aria-label="Filter entries">
              <label className="block text-sm text-gray-300">
                From
                <input type="date" value={filters.from} onChange={setFilter("from")} className={`${field} mt-1`} />
              </label>
              <label className="block text-sm text-gray-300">
                To
                <input type="date" value={filters.to} onChange={setFilter("to")} className={`${field} mt-1`} />
              </label>
              <label className="block text-sm text-gray-300">
                Rating
                <select value={filters.rating} onChange={setFilter("rating")} className={`${field} mt-1`}>
                  <option value="">Any</option>
                  {RATINGS.map((r) => (
                    <option key={r.value} value={r.value}>{r.emoji} {r.label}</option>
                  ))}
                </select>
              </label>
              <label className="block text-sm text-gray-300">
                Feeling
                <select value={filters.emotion} onChange={setFilter("emotion")} className={`${field} mt-1`}>
                  <option value="">Any</option>
                  {EMOTIONS.map((t) => (
                    <option key={t.key} value={t.key}>{t.emoji} {t.label}</option>
                  ))}
                </select>
              </label>
              <label className="block text-sm text-gray-300">
                Activity
                <select value={filters.activity} onChange={setFilter("activity")} className={`${field} mt-1`}>
                  <option value="">Any</option>
                  {ACTIVITIES.map((t) => (
                    <option key={t.key} value={t.key}>{t.emoji} {t.label}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-gray-300">
              <span role="status">
                {rangeBackwards
                  ? "The 'From' date is after the 'To' date."
                  : loading
                  ? "Loading..."
                  : `${total} ${total === 1 ? "entry" : "entries"}${hasFilters ? " match your filters" : ""}`}
              </span>
              {hasFilters && (
                <button type="button" onClick={clearFilters} className="text-blue-400 hover:text-blue-300 underline">
                  Clear filters
                </button>
              )}
            </div>

            <MoodTable
              moods={result.moods}
              onSelect={setSelected}
              title={null}
              loading={loading}
              emptyText={hasFilters ? "No entries match these filters." : "No mood entries yet."}
            />

            <nav className="flex items-center justify-between" aria-label="Pagination">
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => p - 1)}
                className="px-5 py-2.5 rounded-2xl bg-gray-700/60 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300"
              >
                ← Previous
              </button>
              <span className="text-sm text-gray-300">Page {page} of {totalPages}</span>
              <button
                type="button"
                disabled={page >= totalPages || loading}
                onClick={() => setPage((p) => p + 1)}
                className="px-5 py-2.5 rounded-2xl bg-gray-700/60 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300"
              >
                Next →
              </button>
            </nav>
          </div>
        </section>
      </div>

      {selected && (
        <MoodDetailModal
          key={selected._id}
          entry={selected}
          onClose={() => setSelected(null)}
          onChanged={() => setReloadKey((k) => k + 1)}
        />
      )}
    </div>
  );
}
