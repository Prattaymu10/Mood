import useCurrentDateTime from "../../hooks/useCurrentDateTime";

export default function DashboardHeader({ userName, onLogout }) {
  const now = useCurrentDateTime();
  const date = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const time = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-800/30 backdrop-blur-xl border border-gray-700/50 p-6 rounded-3xl shadow-2xl animate-slideInUp">
      <div className="flex items-center space-x-4 mb-4 md:mb-0">
        <div
          className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 animate-glow"
          role="img"
          aria-label="Mood tracker icon"
        >
          <span className="text-2xl animate-bounce-soft">😊</span>
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Mood Dashboard
          </h1>
          <div className="text-sm text-gray-400 animate-pulse-soft" aria-live="polite">
            <span className="inline-flex items-center">
              <span className="mr-2">📅</span>
              {date} • {time}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:block text-sm text-gray-300">
          <span>{userName}</span>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 hover:text-red-200 font-medium rounded-2xl transition-all duration-300 backdrop-blur-md hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500/50"
          aria-label="Sign out of account"
        >
          Sign Out
        </button>
      </div>
    </header>
  );
}
