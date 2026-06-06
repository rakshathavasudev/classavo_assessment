import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import client from "../api/client";

export default function InstructorCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", description: "" });
  const [busy, setBusy] = useState(false);

  function load() {
    setLoading(true);
    client
      .get("/courses/?mine=true")
      .then((res) => setCourses(res.data))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function createCourse(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setBusy(true);
    try {
      await client.post("/courses/", form);
      setForm({ title: "", description: "" });
      load();
    } finally {
      setBusy(false);
    }
  }

  async function remove(id) {
    if (!confirm("Delete this course and all its chapters?")) return;
    await client.delete(`/courses/${id}/`);
    load();
  }

  return (
    <div className="container">
      <h1>My Courses</h1>

      <form className="inline-form" onSubmit={createCourse}>
        <h3>Create a new course</h3>
        <input
          placeholder="Course title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <button className="btn-primary" disabled={busy}>
          {busy ? "Creating..." : "Create course"}
        </button>
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : courses.length === 0 ? (
        <p className="muted">You haven't created any courses yet.</p>
      ) : (
        <div className="card-grid">
          {courses.map((c) => (
            <div key={c.id} className="course-card">
              <h3>{c.title}</h3>
              <p>{c.description}</p>
              <div className="meta">
                <span>{c.chapter_count} chapters</span>
                <span>{c.student_count} students</span>
              </div>
              <div className="card-actions">
                <Link to={`/instructor/courses/${c.id}`} className="btn-primary">
                  Manage chapters
                </Link>
                <button className="btn-danger" onClick={() => remove(c.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
