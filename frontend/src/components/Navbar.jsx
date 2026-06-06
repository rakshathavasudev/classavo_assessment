import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <nav className="navbar">
      <Link to="/" className="brand">
        📘 MiniLMS
      </Link>
      <div className="nav-links">
        {user ? (
          <>
            <Link to="/courses">Browse Courses</Link>
            {user.is_instructor && <Link to="/instructor">My Courses</Link>}
            <span className="role-badge">{user.role}</span>
            <span className="username">{user.username}</span>
            <button onClick={handleLogout} className="btn-link">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
