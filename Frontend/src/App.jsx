import { useEffect } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import ProtectedRoute from "./components/ProtectedRoute";
import ServerStatusBanner from "./components/common/ServerStatusBanner";
import { setUnauthorizedHandler } from "./services/api";
import { clearAuth } from "./utils/auth";

// Any logged-in request that gets a 401 (token expired/invalid) lands here:
// clear the login and go back to the sign-in page with a message.
function SessionGuard() {
  const navigate = useNavigate();
  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearAuth();
      navigate("/login", { replace: true, state: { expired: true } });
    });
    return () => setUnauthorizedHandler(null);
  }, [navigate]);
  return null;
}

export default function App() {
  return (
    <>
      <SessionGuard />
      <ServerStatusBanner />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}
