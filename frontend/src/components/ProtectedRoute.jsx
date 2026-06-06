import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

/**
 * Guards a route. Pass `role="instructor"` to additionally restrict by role.
 */
export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="container">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;

  return children;
}
