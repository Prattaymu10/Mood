import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BackgroundBlobs from "../components/common/BackgroundBlobs";
import LoginForm from "../components/auth/LoginForm";
import SignupForm from "../components/auth/SignupForm";
import { authApi } from "../services/api";
import { clearToken, getToken } from "../utils/auth";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [view, setView] = useState("login"); // "login" | "signup"
  const [leaving, setLeaving] = useState(false);
  const [switched, setSwitched] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const timers = useRef([]);

  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  useEffect(() => {
    document.title = "Mood Tracker - Auth";
  }, []);

  // checkAuthStatus(): already logged in? skip the login page.
  useEffect(() => {
    const token = getToken();
    if (!token) return;
    let cancelled = false;

    authApi
      .verify(token)
      .then((data) => {
        if (!cancelled && data.success) navigate("/dashboard", { replace: true });
      })
      .catch((error) => {
        // 401 = the saved token is no longer valid; anything else (server asleep,
        // database down) just keeps the user on the login page without logging out
        if (error.status === 401) clearToken();
        else console.error("Token verification failed:", error);
      });

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  // Same 200ms out / slide-in switch as switchToSignup / switchToLogin.
  const switchTo = (target) => {
    setSwitched(true);
    setLeaving(true);
    later(() => {
      setView(target);
      setLeaving(false);
    }, 200);
  };

  const handleSignupSuccess = (email) => {
    later(() => {
      switchTo("login");
      later(() => setLoginEmail(email), 300); // pre-fill email on login form
    }, 1500);
  };

  const panelStyle = (name) =>
    switched && view === name
      ? { animation: `slideInUp 0.4s ease-out${leaving ? " reverse" : ""}` }
      : undefined;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 transition-all duration-1000">
      <BackgroundBlobs animationClass="animate-float-lg" />

      <div className="relative w-full max-w-md animate-slideInUp">
        <div className="bg-gray-800/30 backdrop-blur-xl border border-gray-700/50 rounded-3xl shadow-2xl p-8 relative overflow-hidden">
          {/* Gradient border effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-xl opacity-50" />

          <div className="relative z-10">
            {/* Both forms stay mounted so typed values survive switching */}
            <div className={view === "login" ? "" : "hidden"} style={panelStyle("login")}>
              <LoginForm
                notice={location.state?.expired ? "Your session expired. Please sign in again." : null}
                email={loginEmail}
                onEmailChange={setLoginEmail}
                onSwitch={switchTo}
              />
            </div>

            <div className={view === "signup" ? "" : "hidden"} style={panelStyle("signup")}>
              <SignupForm onSuccess={handleSignupSuccess} onSwitch={switchTo} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
