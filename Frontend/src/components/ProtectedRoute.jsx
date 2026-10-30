import { Navigate } from "react-router-dom";
import { getToken } from "../utils/auth";

// Replaces checkAuth() in dashboard.js: no token -> back to login.
export default function ProtectedRoute({ children }) {
  return getToken() ? children : <Navigate to="/login" replace />;
}
