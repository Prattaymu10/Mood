// The three blurred floating circles behind both pages.
// Login used a slightly stronger float, so the animation class is a prop.
export default function BackgroundBlobs({ animationClass = "animate-float" }) {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className={`absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl ${animationClass}`} />
      <div
        className={`absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl ${animationClass}`}
        style={{ animationDelay: "1s" }}
      />
      <div
        className={`absolute top-1/2 left-3/4 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl ${animationClass}`}
        style={{ animationDelay: "2s" }}
      />
    </div>
  );
}
