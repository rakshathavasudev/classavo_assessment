import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import client from "../api/client";

export default function ManageCoursePage() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    Promise.all([
      client.get(`/courses/${id}/`),
      client.get(`/courses/${id}/chapters/`),
    ])
      .then(([courseRes, chRes]) => {
        setCourse(courseRes.data);
        setChapters(chRes.data);
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, [id]);

  async function toggleVisibility(ch) {
    await client.patch(`/courses/${id}/chapters/${ch.id}/`, {
      is_public: !ch.is_public,
    });
    load();
  }

  async function remove(chId) {
    if (!confirm("Delete this chapter?")) return;
    await client.delete(`/courses/${id}/chapters/${chId}/`);
    load();
  }

  if (loading) return <div className="container">Loading...</div>;
  if (!course) return <div className="container">Course not found.</div>;

  return (
    <div className="container">
      <Link to="/instructor" className="back-link">
        ← Back to my courses
      </Link>
      <div className="course-header">
        <div>
          <h1>{course.title}</h1>
          <p className="muted">{course.description}</p>
        </div>
        <Link to={`/instructor/courses/${id}/chapters/new`} className="btn-primary">
          + New chapter
        </Link>
      </div>

      <h2>Chapters</h2>
      {chapters.length === 0 && <p className="muted">No chapters yet.</p>}
      <table className="chapter-table">
        <tbody>
          {chapters.map((ch) => (
            <tr key={ch.id}>
              <td className="ch-title">{ch.title}</td>
              <td>
                {ch.is_public ? (
                  <span className="tag tag-success">Public</span>
                ) : (
                  <span className="tag tag-muted">Private</span>
                )}
              </td>
              <td className="ch-actions">
                <button className="btn-secondary" onClick={() => toggleVisibility(ch)}>
                  Make {ch.is_public ? "private" : "public"}
                </button>
                <Link
                  to={`/instructor/courses/${id}/chapters/${ch.id}/edit`}
                  className="btn-secondary"
                >
                  Edit
                </Link>
                <button className="btn-danger" onClick={() => remove(ch.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
