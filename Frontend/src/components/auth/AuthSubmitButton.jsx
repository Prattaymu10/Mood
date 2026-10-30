export default function AuthSubmitButton({
  theme,
  loading,
  success,
  spinner,
  idleText,
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className={`w-full bg-gradient-to-r ${theme.button} text-white font-semibold py-4 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center relative overflow-hidden group ${success ? "animate-success" : ""}`}
      style={
        loading
          ? { animation: "glow 1s ease-in-out infinite alternate" }
          : undefined
      }
    >
      <div
        className={`absolute inset-0 bg-gradient-to-r ${theme.buttonOverlay} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}
      />
      {loading && <div className="animate-spin mr-3 text-xl">{spinner}</div>}
      <span className="relative z-10">{loading ? "Please wait..." : idleText}</span>
    </button>
  );
}
