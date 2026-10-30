const CARD =
  "p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 animate-float";

export default function MoodInsights({ stats }) {
  return (
    <section
      className="bg-gray-800/30 backdrop-blur-xl border border-gray-700/50 p-8 rounded-3xl shadow-2xl animate-slideInUp relative overflow-hidden"
      aria-labelledby="insights-title"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-red-500/10 rounded-3xl opacity-50" />

      <div className="relative z-10">
        <h2
          id="insights-title"
          className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-6"
        >
          Your Mood Insights
        </h2>

        <div className="grid md:grid-cols-3 gap-6" role="group" aria-label="Mood insights">
          <div className={CARD} role="status" aria-label="Current logging streak">
            <div className="text-3xl mb-3" aria-hidden="true">🔥</div>
            <h3 className="font-bold text-lg mb-2">Current Streak</h3>
            <p className="text-2xl font-bold text-orange-300">{stats.streak}</p>
            <p className="text-sm text-gray-400">Keep logging daily!</p>
          </div>

          <div
            className={CARD}
            style={{ animationDelay: "0.2s" }}
            role="status"
            aria-label="Mood trend indicator"
          >
            <div className="text-3xl mb-3" aria-hidden="true">📈</div>
            <h3 className="font-bold text-lg mb-2">Mood Trend</h3>
            <p className={stats.trend.className}>{stats.trend.label}</p>
            <p className="text-sm text-gray-400">vs last week</p>
          </div>

          <div
            className={CARD}
            style={{ animationDelay: "0.4s" }}
            role="status"
            aria-label="Best mood day this week"
          >
            <div className="text-3xl mb-3" aria-hidden="true">⭐</div>
            <h3 className="font-bold text-lg mb-2">Best Day</h3>
            <p className="text-2xl font-bold text-yellow-300">{stats.bestDay}</p>
            <p className="text-sm text-gray-400">This week's peak</p>
          </div>
        </div>
      </div>
    </section>
  );
}
