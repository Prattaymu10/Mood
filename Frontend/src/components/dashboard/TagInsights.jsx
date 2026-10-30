import { formatDiff, tagEmoji, tagLabel } from "../../utils/mood";

const Row = ({ item, tone }) => (
  <li className="flex items-center justify-between gap-3 py-2">
    <span>
      <span aria-hidden="true" className="mr-2">{tagEmoji(item.tag)}</span>
      {tagLabel(item.tag)}
    </span>
    <span className="text-right text-sm">
      <span className={`font-bold ${tone}`}>{formatDiff(item.diff)}</span>
      <span className="text-gray-400"> · {item.count} entries</span>
    </span>
  </li>
);

function Column({ title, icon, items, tone, empty }) {
  return (
    <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
      <h3 className="font-bold text-lg mb-2">
        <span aria-hidden="true" className="mr-2">{icon}</span>
        {title}
      </h3>
      {items.length ? (
        <ul className="divide-y divide-white/10">
          {items.map((i) => <Row key={i.tag} item={i} tone={tone} />)}
        </ul>
      ) : (
        <p className="text-sm text-gray-400">{empty}</p>
      )}
    </div>
  );
}

/** insights = response of GET /moods/insights (null while loading). */
export default function TagInsights({ insights }) {
  const hasAny = insights && (insights.activities.length > 0 || insights.emotions.length > 0);

  return (
    <section
      className="bg-gray-800/30 backdrop-blur-xl border border-gray-700/50 p-8 rounded-3xl shadow-2xl animate-slideInUp relative overflow-hidden"
      aria-labelledby="tag-insights-title"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 via-blue-500/10 to-indigo-500/10 rounded-3xl opacity-50" />

      <div className="relative z-10">
        <h2 id="tag-insights-title" className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent mb-2">
          What Affects Your Mood
        </h2>

        {!insights ? (
          <p className="text-gray-400">Loading insights...</p>
        ) : !hasAny ? (
          <p className="text-gray-300 mt-2">
            Tag your entries with feelings and activities. Patterns show up once a tag has at
            least {insights.minEntries} entries in the last {insights.windowDays} days.
          </p>
        ) : (
          <>
            <p className="text-gray-400 mb-6">
              Compared with your overall average of{" "}
              <strong className="text-gray-200">{insights.overall.avgRating ?? "--"}</strong> over the
              last {insights.windowDays} days ({insights.overall.totalEntries} entries).
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              <Column
                title="Lifts your mood"
                icon="📈"
                tone="text-green-300"
                items={insights.lifts}
                empty="No activity stands out yet."
              />
              <Column
                title="Drags it down"
                icon="📉"
                tone="text-red-300"
                items={insights.drags}
                empty="No activity stands out yet."
              />
              <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
                <h3 className="font-bold text-lg mb-2">
                  <span aria-hidden="true" className="mr-2">💭</span>
                  Most common feelings
                </h3>
                {insights.emotions.length ? (
                  <ul className="divide-y divide-white/10">
                    {insights.emotions.map((e) => (
                      <li key={e.tag} className="flex items-center justify-between gap-3 py-2">
                        <span>
                          <span aria-hidden="true" className="mr-2">{tagEmoji(e.tag)}</span>
                          {tagLabel(e.tag)}
                        </span>
                        <span className="text-sm text-gray-400">{e.count}× · avg {e.avgRating}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-400">Tag some feelings to see them here.</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
