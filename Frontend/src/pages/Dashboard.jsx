import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import BackgroundBlobs from "../components/common/BackgroundBlobs";
import AppHeader from "../components/common/AppHeader";
import MoodEntrySection from "../components/dashboard/MoodEntrySection";
import MoodAnalytics from "../components/dashboard/MoodAnalytics";
import MoodInsights from "../components/dashboard/MoodInsights";
import TagInsights from "../components/dashboard/TagInsights";
import MoodDetailModal from "../components/mood/MoodDetailModal";
import { moodApi } from "../services/api";
import { clearAuth, getUser } from "../utils/auth";
import { computeStats } from "../utils/stats";
import { useNotification } from "../context/NotificationContext";

export default function Dashboard() {
  const navigate = useNavigate();
  const { showNotification, showError } = useNotification();
  const [moods, setMoods] = useState([]); // 10 most recent (table)
  const [history, setHistory] = useState([]); // last 30 days (stats + chart)
  const [dailyCount, setDailyCount] = useState(null);
  const [insights, setInsights] = useState(null);
  const [selected, setSelected] = useState(null);
  const user = useMemo(() => getUser(), []);
  const logoutTimer = useRef();

  useEffect(() => {
    document.title = "Mood Dashboard";
    return () => clearTimeout(logoutTimer.current);
  }, []);

  const loadDailyCount = useCallback(async () => {
    try {
      const data = await moodApi.getDailyCount();
      if (data.success) {
        setDailyCount({ todayCount: data.todayCount, remaining: data.remaining });
      }
    } catch (error) {
      showError(error);
    }
  }, [showError]);

  const loadMoods = useCallback(async () => {
    try {
      const data = await moodApi.getDashboard();
      if (data.success && Array.isArray(data.moods)) {
        setMoods(data.moods);
        setHistory(Array.isArray(data.history) ? data.history : data.moods);
      } else {
        showNotification("Failed to load mood data", "error");
      }
    } catch (error) {
      showError(error);
    }
  }, [showNotification, showError]);

  const loadInsights = useCallback(async () => {
    try {
      const data = await moodApi.getInsights();
      if (data.success) setInsights(data);
    } catch (error) {
      showError(error);
    }
  }, [showError]);

  const refreshAll = useCallback(
    () => Promise.all([loadMoods(), loadDailyCount(), loadInsights()]),
    [loadMoods, loadDailyCount, loadInsights]
  );

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Resolves true when the mood was saved (MoodForm uses it for its button state)
  const handleSaveMood = async ({ rating, emotions, activities, note }) => {
    try {
      const data = await moodApi.add({ rating, emotions, activities, note: note.trim() });
      if (!data.success) throw new Error(data.message || "Failed to save mood");

      const remainingText =
        data.remainingToday !== undefined
          ? `${data.remainingToday} entries remaining today.`
          : "Mood saved successfully!";
      showNotification(`Mood saved! ${remainingText}`, "success");

      await refreshAll();
      return true;
    } catch (error) {
      showError(error, "Failed to save mood. Please try again.");
      return false;
    }
  };

  const handleLogout = () => {
    clearAuth();
    showNotification("Logged out successfully", "success");
    logoutTimer.current = setTimeout(() => navigate("/login"), 1000);
  };

  const stats = useMemo(() => computeStats(history), [history]);

  return (
    <div className="min-h-screen px-4 pt-6 pb-10 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white transition-all duration-1000">
      <BackgroundBlobs animationClass="animate-float" />

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        <AppHeader title="Mood Dashboard" userName={user?.name} onLogout={handleLogout} />
        <MoodEntrySection dailyCount={dailyCount} onSave={handleSaveMood} />
        <MoodAnalytics moods={moods} history={history} stats={stats} onSelect={setSelected} />
        <TagInsights insights={insights} />
        <MoodInsights stats={stats} />
      </div>

      {selected && (
        <MoodDetailModal
          key={selected._id}
          entry={selected}
          onClose={() => setSelected(null)}
          onChanged={refreshAll}
        />
      )}
    </div>
  );
}
