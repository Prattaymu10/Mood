import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../services/api";
import { setAuth } from "../../utils/auth";
import { EMAIL_REGEX } from "../../utils/validators";
import useTimedAlert from "../../hooks/useTimedAlert";
import useShake from "../../hooks/useShake";
import AuthHeader from "./AuthHeader";
import AuthField from "./AuthField";
import AuthSubmitButton from "./AuthSubmitButton";
import FormAlert from "./FormAlert";
import { THEMES } from "./theme";

const theme = THEMES.login;

export default function LoginForm({ email, onEmailChange, onSwitch, notice }) {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [alert, showAlert] = useTimedAlert();
  const [shaking, shake] = useShake();
  const redirectTimer = useRef();

  useEffect(() => () => clearTimeout(redirectTimer.current), []);

  // e.g. "Your session expired" after being sent back from the dashboard
  useEffect(() => {
    if (notice) showAlert(notice, "error");
  }, [notice, showAlert]);

  const fail = (message) => {
    showAlert(message);
    shake();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = email.trim();

    if (!trimmed || !password) return fail("Please fill in all fields");
    if (!EMAIL_REGEX.test(trimmed))
      return fail("Please enter a valid email address");

    setLoading(true);
    try {
      const data = await authApi.login({ email: trimmed, password });

      if (data.success && data.token) {
        setAuth(data.token, data.user);
        showAlert("Login successful! 🎉", "success");
        setSuccess(true);
        redirectTimer.current = setTimeout(() => navigate("/dashboard"), 1000);
      } else {
        fail(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      fail(error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-white">
      <AuthHeader
        theme={theme}
        icon="😊"
        title="Mood Tracker"
        subtitle="Track your emotions, improve your wellbeing"
      />

      <FormAlert alert={alert} />

      <form
        onSubmit={handleSubmit}
        className={`space-y-6 ${shaking ? "animate-shake" : ""}`}
      >
        <AuthField
          id="loginEmail"
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={onEmailChange}
          theme={theme}
        />
        <AuthField
          id="loginPassword"
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          theme={theme}
        />
        <AuthSubmitButton
          theme={theme}
          loading={loading}
          success={success}
          spinner="⭐"
          idleText="Sign In"
        />
      </form>

      <div className="mt-8 text-center">
        <p className="text-gray-400">
          Don't have an account?
          <button
            type="button"
            onClick={() => onSwitch("signup")}
            className={`${theme.link} ml-1 font-medium transition-colors duration-300 hover:underline`}
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}
