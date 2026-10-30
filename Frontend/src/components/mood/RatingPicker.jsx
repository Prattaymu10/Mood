import { RATINGS } from "../../utils/mood";

/** Five faces, very bad -> great. Shows words, stores 1-5. */
export default function RatingPicker({ value, onChange, disabled = false }) {
  return (
    <div role="radiogroup" aria-label="How are you feeling?" className="grid grid-cols-5 gap-2">
      {RATINGS.map((r) => {
        const selected = value === r.value;
        return (
          <button
            key={r.value}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(r.value)}
            className={`flex flex-col items-center gap-1 py-3 px-1 rounded-2xl border backdrop-blur-md transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:hover:scale-100 ${
              selected
                ? `${r.active} scale-105 shadow-lg`
                : "bg-gray-700/50 border-gray-600/50 text-gray-300 hover:bg-gray-700/70"
            }`}
          >
            <span className="text-3xl" aria-hidden="true">{r.emoji}</span>
            <span className="text-[11px] sm:text-xs font-medium whitespace-nowrap">{r.label}</span>
          </button>
        );
      })}
    </div>
  );
}
