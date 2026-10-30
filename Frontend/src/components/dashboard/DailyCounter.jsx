import { MAX_DAILY_MOODS } from "../../utils/mood";

const BASE = "mb-6 p-4 rounded-2xl backdrop-blur-md text-sm animate-scale-in";

/** dailyCount = { todayCount, remaining } | null (still loading) */
export default function DailyCounter({ dailyCount }) {
  if (!dailyCount) {
    return (
      <div className={BASE} role="status" aria-live="polite">
        <span>Loading daily count...</span>
      </div>
    );
  }

  const { todayCount, remaining } = dailyCount;

  if (remaining <= 0) {
    return (
      <div
        className={`${BASE} bg-red-500/20 border border-red-500/30 text-red-200`}
        role="status"
        aria-live="polite"
      >
        <div className="flex items-center">
          <span className="text-2xl mr-3">🎯</span>
          <div>
            <div className="font-bold">Daily limit reached!</div>
            <div className="text-sm opacity-80">
              You've logged <strong>{todayCount}/{MAX_DAILY_MOODS}</strong> moods today. Great job!
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${BASE} bg-blue-500/20 border border-blue-500/30 text-blue-200`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center">
        <span className="text-2xl mr-3">📊</span>
        <div>
          <div className="font-bold">
            Today's Progress:{" "}
            <span className="text-blue-300">{todayCount}/{MAX_DAILY_MOODS}</span>
          </div>
          <div className="text-sm opacity-80">{remaining} entries remaining</div>
        </div>
      </div>
    </div>
  );
}
