import { useSyncExternalStore } from "react";
import { getSlowSnapshot, subscribeSlow } from "../../services/apiStatus";

// Shown when a request is still pending after a few seconds (free hosting wakes up slowly)
export default function ServerStatusBanner() {
  const slow = useSyncExternalStore(subscribeSlow, getSlowSnapshot, () => false);
  if (!slow) return null;
  return (
    <div
      role="status"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-md w-[calc(100%-2rem)] px-5 py-3 rounded-2xl bg-yellow-500/20 border border-yellow-500/40 text-yellow-100 backdrop-blur-xl shadow-2xl animate-slideInUp"
    >
      <span className="animate-spin inline-block mr-2" aria-hidden="true">⏳</span>
      Waking up the server. This can take up to a minute the first time...
    </div>
  );
}
