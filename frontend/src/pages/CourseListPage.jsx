import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import client from "../api/client";

export default function CourseListPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    client
      .get("/courses/")
      .then((res) => setCourses(res.data))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function join(id) {
    await client.post(`/courses/${id}/join/`);
    load();
  }

  if (loading)
    return (
      <div className="container">
        <div className="loader">
          <span className="spinner" /> Loading courses…
        </div>
      </div>
    );

  return (
    <div className="container">
      <div className="page-head">
        <h1>Available Courses</h1>
        <p className="subtitle">
          Browse the catalog and join a course to start learning.
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="empty-state">
          <div className="big">📭</div>
          No courses are available yet. Check back soon!
        </div>
      ) : (
        <div className="card-grid">
          {courses.map((c) => (
            <div key={c.id} className="course-card">
              <div className="course-top">
                <div className="course-avatar">{c.title.charAt(0)}</div>
                <div>
                  <h3>{c.title}</h3>
                  <p className="muted" style={{ margin: 0, fontSize: 13 }}>
                    by {c.instructor_name}
                  </p>
                </div>
              </div>
              <p className="desc">{c.description || "No description provided."}</p>
              <div className="meta">
                <span>📖 {c.chapter_count} chapters</span>
                <span>👥 {c.student_count} students</span>
              </div>
              <div className="card-actions">
                <Link to={`/courses/${c.id}`} className="btn-secondary">
                  View
                </Link>
                {c.is_owner ? (
                  <span className="tag">⭐ Your course</span>
                ) : c.is_enrolled ? (
                  <span className="tag tag-success">✓ Enrolled</span>
                ) : (
                  <button className="btn-primary" onClick={() => join(c.id)}>
                    Join
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
