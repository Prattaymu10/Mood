import MoodChart from "./MoodChart";
import MoodTable from "./MoodTable";

export default function MoodAnalytics({ moods, history, stats, onSelect }) {
  return (
    <section
      className="bg-gray-800/30 backdrop-blur-xl border border-gray-700/50 p-8 rounded-3xl shadow-2xl animate-slideInRight relative overflow-hidden"
      aria-labelledby="analytics-title"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-blue-500/10 to-purple-500/10 rounded-3xl opacity-50" />

      <div className="relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h2 id="analytics-title" className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent mb-2">
              7-Day Mood Overview
            </h2>
            <p className="text-gray-400">Track your emotional patterns and see your progress</p>
          </div>

          <div className="flex space-x-4 mt-4 md:mt-0" role="group" aria-label="Mood statistics">
            <div className="text-center p-3 rounded-2xl bg-green-500/20 border border-green-500/30 min-w-[96px]" role="status" aria-label="Average mood this week">
              <div className="text-2xl font-bold text-green-300">{stats.avgMood}</div>
              <div className="text-xs text-green-200">Avg Mood{stats.avgLabel ? ` · ${stats.avgLabel}` : ""}</div>
            </div>
            <div className="text-center p-3 rounded-2xl bg-blue-500/20 border border-blue-500/30 min-w-[96px]" role="status" aria-label="Entries this week">
              <div className="text-2xl font-bold text-blue-300">{stats.totalEntries}</div>
              <div className="text-xs text-blue-200">Entries · 7 days</div>
            </div>
          </div>
        </div>

        <MoodChart moods={history} />
        <MoodTable moods={moods} onSelect={onSelect} />
      </div>
    </section>
  );
}
