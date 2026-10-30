import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { NotificationProvider } from "./context/NotificationContext";
import "./index.css";

// Dark mode is enforced permanently (initDarkMode() in the original login.js)
document.documentElement.classList.add("dark");
localStorage.setItem("theme", "dark");

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <NotificationProvider>
        <App />
      </NotificationProvider>
    </BrowserRouter>
  </StrictMode>
);
