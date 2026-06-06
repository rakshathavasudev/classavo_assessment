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

  if (loading) return <div className="container">Loading courses...</div>;

  return (
    <div className="container">
      <h1>Available Courses</h1>
      {courses.length === 0 && <p className="muted">No courses yet.</p>}
      <div className="card-grid">
        {courses.map((c) => (
          <div key={c.id} className="course-card">
            <h3>{c.title}</h3>
            <p className="muted">by {c.instructor_name}</p>
            <p>{c.description}</p>
            <div className="meta">
              <span>{c.chapter_count} chapters</span>
              <span>{c.student_count} students</span>
            </div>
            <div className="card-actions">
              <Link to={`/courses/${c.id}`} className="btn-secondary">
                View
              </Link>
              {c.is_owner ? (
                <span className="tag">Your course</span>
              ) : c.is_enrolled ? (
                <span className="tag tag-success">Enrolled ✓</span>
              ) : (
                <button className="btn-primary" onClick={() => join(c.id)}>
                  Join
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
