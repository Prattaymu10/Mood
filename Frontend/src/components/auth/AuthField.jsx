import { useState } from "react";

/** Labelled input with the focus-glow overlay; type="password" gets the 👁️/🙈 toggle. */
export default function AuthField({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  theme,
}) {
  const isPassword = type === "password";
  const [visible, setVisible] = useState(false);
  const [popped, setPopped] = useState(false);

  const glow = (
    <div
      className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${theme.glow} transition-all duration-500 pointer-events-none`}
    />
  );

  return (
    <div className="group">
      <label
        htmlFor={id}
        className="block mb-2 font-medium text-gray-300 transition-colors duration-300"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={isPassword && visible ? "text" : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required
          className={`w-full p-4 ${isPassword ? "pr-12" : ""} rounded-2xl bg-gray-700/50 text-white placeholder-gray-400 border border-gray-600/50 backdrop-blur-md focus:outline-none focus:ring-2 ${theme.ring} transition-all duration-300 hover:bg-gray-700/70`}
        />
        {isPassword && (
          <button
            key={String(visible)}
            type="button"
            onClick={() => {
              setVisible((v) => !v);
              setPopped(true);
            }}
            aria-label={visible ? "Hide password" : "Show password"}
            className={`absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-all duration-300 hover:scale-110 ${popped ? "animate-success-quick" : ""}`}
          >
            {visible ? "🙈" : "👁️"}
          </button>
        )}
        {glow}
      </div>
    </div>
  );
}
