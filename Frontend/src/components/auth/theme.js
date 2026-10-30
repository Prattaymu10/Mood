// Tailwind needs full class strings, so both colour themes are spelled out here.
export const THEMES = {
  login: {
    iconBg: "from-blue-500 to-purple-600",
    title: "from-blue-400 to-purple-400",
    ring: "focus:ring-blue-500/50 focus:border-blue-500/50",
    glow: "from-blue-500/0 via-purple-500/0 to-pink-500/0 group-focus-within:from-blue-500/10 group-focus-within:via-purple-500/10 group-focus-within:to-pink-500/10",
    button: "from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
    buttonOverlay: "from-blue-400 to-purple-400",
    link: "text-blue-400 hover:text-blue-300",
  },
  signup: {
    iconBg: "from-green-500 to-blue-600",
    title: "from-green-400 to-blue-400",
    ring: "focus:ring-green-500/50 focus:border-green-500/50",
    glow: "from-green-500/0 via-blue-500/0 to-purple-500/0 group-focus-within:from-green-500/10 group-focus-within:via-blue-500/10 group-focus-within:to-purple-500/10",
    button: "from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700",
    buttonOverlay: "from-green-400 to-blue-400",
    link: "text-green-400 hover:text-green-300",
  },
};
