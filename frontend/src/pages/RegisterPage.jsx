import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

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
    <div className="auth-card">
      <h2>Create an account</h2>
      <form onSubmit={handleSubmit}>
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
        <label>I am a...</label>
        <select value={form.role} onChange={update("role")}>
          <option value="student">Student</option>
          <option value="instructor">Instructor</option>
        </select>
        {error && <p className="error">{error}</p>}
        <button className="btn-primary" disabled={busy}>
          {busy ? "Creating..." : "Register"}
        </button>
      </form>
      <p className="muted">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}
