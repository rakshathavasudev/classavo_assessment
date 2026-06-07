import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const ROLES = [
  { value: "student", icon: "🎓", label: "Student", blurb: "Join & learn" },
  { value: "instructor", icon: "🧑‍🏫", label: "Instructor", blurb: "Create & teach" },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "student",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await register(form);
      navigate("/");
    } catch (err) {
      const data = err.response?.data;
      setError(
        data ? Object.values(data).flat().join(" ") : "Registration failed."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-logo">📘</div>
        <h2>Create your account</h2>
        <p className="lead">Start teaching or learning in seconds.</p>
        <form onSubmit={handleSubmit}>
          <label>I want to join as</label>
          <div className="role-picker">
            {ROLES.map((r) => (
              <button
                type="button"
                key={r.value}
                className={`role-option${form.role === r.value ? " selected" : ""}`}
                onClick={() => setForm({ ...form, role: r.value })}
              >
                <span className="role-emoji">{r.icon}</span>
                <span className="role-name">{r.label}</span>
                <span className="role-blurb">{r.blurb}</span>
              </button>
            ))}
          </div>

          <label>Username</label>
          <input value={form.username} onChange={update("username")} required />
          <label>Email</label>
          <input type="email" value={form.email} onChange={update("email")} />
          <label>Password</label>
          <input
            type="password"
            value={form.password}
            onChange={update("password")}
            required
            minLength={6}
          />
          {error && <p className="error">{error}</p>}
          <button className="btn-primary btn-block" disabled={busy}>
            {busy ? "Creating…" : "Create account"}
          </button>
        </form>
        <p className="divider">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
