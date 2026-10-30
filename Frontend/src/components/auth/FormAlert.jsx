const STYLES = {
  error: "bg-red-500/20 text-red-200 border-red-500/30",
  success: "bg-green-500/20 text-green-200 border-green-500/30",
};

export default function FormAlert({ alert }) {
  if (!alert) return null;
  return (
    <div
      role="alert"
      className={`mb-6 p-4 rounded-2xl border backdrop-blur-md ${STYLES[alert.type]} animate-slideInUp`}
      style={
        alert.leaving
          ? { animation: "fadeIn 0.3s ease-out reverse forwards" }
          : undefined
      }
    >
      {alert.message}
    </div>
  );
}
