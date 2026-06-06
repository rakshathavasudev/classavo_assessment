import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import client from "../api/client";
import PlateEditor from "../components/PlateEditor";

export default function ChapterViewPage() {
  const { courseId, chapterId } = useParams();
  const [chapter, setChapter] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    client
      .get(`/courses/${courseId}/chapters/${chapterId}/`)
      .then((res) => setChapter(res.data))
      .catch((err) => {
        setError(
          err.response?.status === 403
            ? "This chapter is private and not available to you."
            : "Chapter not found."
        );
      })
      .finally(() => setLoading(false));
  }, [courseId, chapterId]);

  if (loading) return <div className="container">Loading...</div>;

  if (error)
    return (
      <div className="container">
        <Link to={`/courses/${courseId}`} className="back-link">
          ← Back to course
        </Link>
        <p className="error">{error}</p>
      </div>
    );

  return (
    <div className="container reading">
      <Link to={`/courses/${courseId}`} className="back-link">
        ← Back to course
      </Link>
      <h1>{chapter.title}</h1>
      {!chapter.is_public && <span className="tag tag-muted">Private (preview)</span>}
      <article className="chapter-content">
        {/* Read-only Plate render keyed so it re-mounts when the chapter changes */}
        <PlateEditor key={chapter.id} value={chapter.content} readOnly />
      </article>
    </div>
  );
}
