import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(username, password);
      navigate("/");
    } catch {
      setError("Invalid username or password.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-logo">📘</div>
        <h2>Welcome back</h2>
        <p className="lead">Log in to continue to MiniLMS.</p>
        <form onSubmit={handleSubmit}>
          <label>Username</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} required />
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="error">{error}</p>}
          <button className="btn-primary btn-block" disabled={busy}>
            {busy ? "Logging in…" : "Log in"}
          </button>
        </form>
        <p className="divider">
          No account? <Link to="/register">Create one</Link>
        </p>
        <div className="hint">
          <strong>Demo accounts</strong>
          <div>
            <span className="cred">instructor</span> / password123
          </div>
          <div>
            <span className="cred">student</span> / password123
          </div>
        </div>
      </div>
    </div>
  );
}
