export default function AuthHeader({ theme, icon, title, subtitle }) {
  return (
    <div className="text-center mb-8 animate-fadeIn">
      <div
        className={`inline-block p-4 rounded-full bg-gradient-to-br ${theme.iconBg} mb-4 animate-glow-lg`}
      >
        <span className="text-3xl">{icon}</span>
      </div>
      <h2
        className={`text-4xl font-bold bg-gradient-to-r ${theme.title} bg-clip-text text-transparent mb-2`}
      >
        {title}
      </h2>
      <p className="text-gray-400">{subtitle}</p>
    </div>
  );
}
