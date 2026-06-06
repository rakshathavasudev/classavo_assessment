import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import client from "../api/client";

export default function CourseDetailPage() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    client
      .get(`/courses/${id}/`)
      .then((res) => setCourse(res.data))
      .finally(() => setLoading(false));
  }

  useEffect(load, [id]);

  async function join() {
    await client.post(`/courses/${id}/join/`);
    load();
  }

  if (loading) return <div className="container">Loading...</div>;
  if (!course) return <div className="container">Course not found.</div>;

  return (
    <div className="container">
      <Link to="/courses" className="back-link">
        ← Back to courses
      </Link>
      <div className="course-header">
        <div>
          <h1>{course.title}</h1>
          <p className="muted">by {course.instructor_name}</p>
          <p>{course.description}</p>
        </div>
        {!course.is_owner &&
          (course.is_enrolled ? (
            <span className="tag tag-success">Enrolled ✓</span>
          ) : (
            <button className="btn-primary" onClick={join}>
              Join course
            </button>
          ))}
      </div>

      <h2>Chapters</h2>
      {course.is_owner && (
        <p className="muted">
          You see all chapters. Students can only open public ones.
        </p>
      )}
      {course.chapters.length === 0 && (
        <p className="muted">No chapters available yet.</p>
      )}
      <ul className="chapter-list">
        {course.chapters.map((ch) => (
          <li key={ch.id}>
            <Link to={`/courses/${course.id}/chapters/${ch.id}`}>
              {ch.title}
            </Link>
            {ch.is_public ? (
              <span className="tag tag-success">Public</span>
            ) : (
              <span className="tag tag-muted">Private</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
