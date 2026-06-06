import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="container">
      <h1>Welcome, {user.username} 👋</h1>
      <p className="muted">
        You are signed in as an <strong>{user.role}</strong>.
      </p>

      <div className="card-grid">
        <Link to="/courses" className="action-card">
          <h3>Browse Courses</h3>
          <p>See all available courses and join the ones you like.</p>
        </Link>

        {user.is_instructor && (
          <Link to="/instructor" className="action-card">
            <h3>My Courses</h3>
            <p>Create courses, add chapters, and manage visibility.</p>
          </Link>
        )}
      </div>
    </div>
  );
}
