import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

const NotificationContext = createContext(null);

const BG = {
  success: "bg-green-500/20 border-green-500/30 text-green-200",
  error: "bg-red-500/20 border-red-500/30 text-red-200",
  info: "bg-blue-500/20 border-blue-500/30 text-blue-200",
};
const ICON = { success: "✅", error: "❌", info: "ℹ️" };

/** Replaces showNotification() from dashboard.js (toasts, top-right, auto-dismiss 5s). */
export function NotificationProvider({ children }) {
  const [items, setItems] = useState([]);
  const nextId = useRef(1);
  const timers = useRef(new Set());

  const later = useCallback((fn, ms) => {
    const id = setTimeout(() => {
      timers.current.delete(id);
      fn();
    }, ms);
    timers.current.add(id);
  }, []);

  useEffect(() => {
    const set = timers.current;
    return () => set.forEach(clearTimeout);
  }, []);

  const dismiss = useCallback((id) => {
    setItems((list) => list.filter((n) => n.id !== id));
  }, []);

  const showNotification = useCallback(
    (message, type = "info") => {
      const id = nextId.current++;
      setItems((list) =>
        list.some((n) => n.message === message && n.type === type && !n.leaving)
          ? list // identical toast already on screen (e.g. 3 requests failing together)
          : [...list, { id, message, type, leaving: false }]
      );

      later(() => {
        setItems((list) =>
          list.map((n) => (n.id === id ? { ...n, leaving: true } : n))
        );
        later(() => dismiss(id), 300);
      }, 5000);
    },
    [dismiss, later]
  );

  // For caught API errors. A 401 is handled by the session guard (it redirects to
  // the login page with a friendly message), so no extra red toast for it.
  const showError = useCallback(
    (error, fallback = "Something went wrong. Please try again.") => {
      if (error?.status === 401) return;
      console.error(error);
      showNotification(error?.message || fallback, "error");
    },
    [showNotification]
  );

  return (
    <NotificationContext.Provider value={{ showNotification, showError }}>
      {children}

      <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 max-w-sm pointer-events-none">
        {items.map((n) => (
          <div
            key={n.id}
            role="status"
            className={`pointer-events-auto p-4 rounded-2xl backdrop-blur-xl border ${BG[n.type]} shadow-2xl animate-slideInRight`}
            style={
              n.leaving
                ? { animation: "slideInRight 0.3s ease-out reverse forwards" }
                : undefined
            }
          >
            <div className="flex items-start space-x-3">
              <span className="text-xl">{ICON[n.type]}</span>
              <p className="flex-1">{n.message}</p>
              <button
                type="button"
                onClick={() => dismiss(n.id)}
                className="text-gray-400 hover:text-white"
                aria-label="Dismiss notification"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotification must be used inside <NotificationProvider>");
  return ctx;
}
