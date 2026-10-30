import DailyCounter from "./DailyCounter";
import MoodForm from "./MoodForm";
import TipBox from "./TipBox";

export default function MoodEntrySection({ dailyCount, onSave }) {
  const limitReached = !!dailyCount && dailyCount.remaining <= 0;

  return (
    <section
      className="bg-gray-800/30 backdrop-blur-xl border border-gray-700/50 p-8 rounded-3xl shadow-2xl animate-slideInLeft relative overflow-hidden"
      aria-labelledby="mood-entry-title"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl opacity-50" />

      <div className="relative z-10">
        <div className="flex justify-between items-center mb-6">
          <h2
            id="mood-entry-title"
            className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
          >
            Daily Mood Tracker
          </h2>
        </div>

        <DailyCounter dailyCount={dailyCount} />

        <div className="grid md:grid-cols-2 gap-6">
          <MoodForm onSave={onSave} limitReached={limitReached} />
          <TipBox />
        </div>
      </div>
    </section>
  );
}
