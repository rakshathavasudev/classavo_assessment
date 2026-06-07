import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="container">
      <section className="hero">
        <h1>Welcome back, {user.username} 👋</h1>
        <p>
          {user.is_instructor
            ? "Create courses, write chapters, and share knowledge with your students."
            : "Discover new courses and pick up where you left off."}
        </p>
        <span className="pill">● {user.role}</span>
      </section>

      <div className="card-grid">
        <Link to="/courses" className="action-card">
          <div className="action-icon">🔍</div>
          <h3>Browse Courses</h3>
          <p>Explore all available courses and join the ones you like.</p>
          <span className="arrow">Explore →</span>
        </Link>

        {user.is_instructor && (
          <Link to="/instructor" className="action-card">
            <div className="action-icon">✏️</div>
            <h3>My Courses</h3>
            <p>Create courses, add chapters, and manage their visibility.</p>
            <span className="arrow">Manage →</span>
          </Link>
        )}

        {user.is_instructor && (
          <Link to="/instructor" className="action-card">
            <div className="action-icon">📝</div>
            <h3>Author with Plate</h3>
            <p>Write rich chapter content with a modern block editor.</p>
            <span className="arrow">Start writing →</span>
          </Link>
        )}
      </div>
    </div>
  );
}
