import { useState } from "react";
import { authApi } from "../../services/api";
import { EMAIL_REGEX } from "../../utils/validators";
import useTimedAlert from "../../hooks/useTimedAlert";
import useShake from "../../hooks/useShake";
import AuthHeader from "./AuthHeader";
import AuthField from "./AuthField";
import AuthSubmitButton from "./AuthSubmitButton";
import FormAlert from "./FormAlert";
import { THEMES } from "./theme";

const theme = THEMES.signup;

export default function SignupForm({ onSuccess, onSwitch }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [alert, showAlert] = useTimedAlert();
  const [shaking, shake] = useShake();

  const fail = (message) => {
    showAlert(message);
    shake();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanName = name.trim();
    const cleanEmail = email.trim();

    if (!cleanName || !cleanEmail || !password)
      return fail("Please fill in all fields");
    if (cleanName.length < 3)
      return fail("Name must be at least 3 characters long");
    if (!EMAIL_REGEX.test(cleanEmail))
      return fail("Please enter a valid email address");
    if (password.length < 8)
      return fail("Password must be at least 8 characters long");

    setLoading(true);
    try {
      const data = await authApi.signup({
        name: cleanName,
        email: cleanEmail,
        password,
      });

      if (data.success) {
        showAlert("Account created successfully! 🌟", "success");
        setSuccess(true);
        setName("");
        setEmail("");
        setPassword("");
        onSuccess(cleanEmail);
      } else {
        let message = data.message || "Registration failed";
        if (data.errors && Array.isArray(data.errors)) {
          message = data.errors
            .map((err) => err.msg || err.message || err)
            .join(", ");
        }
        fail(message);
      }
    } catch (error) {
      console.error("Signup error:", error);
      fail(error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-white">
      <AuthHeader
        theme={theme}
        icon="🌟"
        title="Create Account"
        subtitle="Join thousands tracking their mood"
      />

      <FormAlert alert={alert} />

      <form
        onSubmit={handleSubmit}
        className={`space-y-6 ${shaking ? "animate-shake" : ""}`}
      >
        <AuthField
          id="signupName"
          label="Name"
          placeholder="Your name"
          value={name}
          onChange={setName}
          theme={theme}
        />
        <AuthField
          id="signupEmail"
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={setEmail}
          theme={theme}
        />
        <AuthField
          id="signupPassword"
          label="Password"
          type="password"
          placeholder="At least 8 characters"
          value={password}
          onChange={setPassword}
          theme={theme}
        />
        <AuthSubmitButton
          theme={theme}
          loading={loading}
          success={success}
          spinner="🌟"
          idleText="Sign Up"
        />
      </form>

      <div className="mt-8 text-center">
        <p className="text-gray-400">
          Already have an account?
          <button
            type="button"
            onClick={() => onSwitch("login")}
            className={`${theme.link} ml-1 font-medium transition-colors duration-300 hover:underline`}
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  );
}
