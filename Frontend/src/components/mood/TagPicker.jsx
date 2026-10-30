import { MAX_TAGS_PER_GROUP } from "../../utils/mood";

/** Toggleable chips. `options` = [{ key, label, emoji }], `value` = selected keys. */
export default function TagPicker({ title, hint, options, value, onChange, disabled = false }) {
  const full = value.length >= MAX_TAGS_PER_GROUP;

  const toggle = (key) => {
    if (value.includes(key)) onChange(value.filter((k) => k !== key));
    else if (!full) onChange([...value, key]);
  };

  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="font-medium text-gray-200">
          {title} <span className="text-xs text-gray-400 font-normal">(optional)</span>
        </span>
        <span className="text-xs text-gray-400">{value.length}/{MAX_TAGS_PER_GROUP}</span>
      </div>
      <div className="flex flex-wrap gap-2" role="group" aria-label={title}>
        {options.map((o) => {
          const on = value.includes(o.key);
          return (
            <button
              key={o.key}
              type="button"
              aria-pressed={on}
              disabled={disabled || (!on && full)}
              onClick={() => toggle(o.key)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-40 disabled:cursor-not-allowed ${
                on
                  ? "bg-blue-500/25 border-blue-400/60 text-blue-100"
                  : "bg-gray-700/40 border-gray-600/50 text-gray-300 hover:bg-gray-700/70"
              }`}
            >
              <span aria-hidden="true">{o.emoji}</span> {o.label}
            </button>
          );
        })}
      </div>
      {hint && <p className="text-xs text-gray-400 mt-2">{hint}</p>}
    </div>
  );
}
