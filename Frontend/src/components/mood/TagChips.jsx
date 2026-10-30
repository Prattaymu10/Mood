import { tagEmoji, tagLabel } from "../../utils/mood";

/** Read-only chips. compact = emoji only (tooltip has the name) for table rows. */
export default function TagChips({ tags = [], compact = false }) {
  if (!tags.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((t) => (
        <span
          key={t}
          title={tagLabel(t)}
          className="px-2 py-0.5 rounded-full text-xs bg-white/10 border border-white/10 text-gray-200"
        >
          <span aria-hidden="true">{tagEmoji(t)}</span>
          {compact ? <span className="sr-only">{tagLabel(t)}</span> : ` ${tagLabel(t)}`}
        </span>
      ))}
    </div>
  );
}
