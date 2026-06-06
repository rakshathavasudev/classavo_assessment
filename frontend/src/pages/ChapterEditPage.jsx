import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import client from "../api/client";
import PlateEditor, { EMPTY_VALUE } from "../components/PlateEditor";

export default function ChapterEditPage() {
  const { id, chapterId } = useParams(); // id = courseId
  const navigate = useNavigate();
  const isNew = !chapterId;

  const [title, setTitle] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [content, setContent] = useState(EMPTY_VALUE);
  const [ready, setReady] = useState(isNew);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Load the existing chapter when editing.
  useEffect(() => {
    if (isNew) return;
    client.get(`/courses/${id}/chapters/${chapterId}/`).then((res) => {
      setTitle(res.data.title);
      setIsPublic(res.data.is_public);
      setContent(res.data.content?.length ? res.data.content : EMPTY_VALUE);
      setReady(true);
    });
  }, [id, chapterId, isNew]);

  async function save(e) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    setBusy(true);
    setError("");
    const payload = { title, is_public: isPublic, content };
    try {
      if (isNew) {
        await client.post(`/courses/${id}/chapters/`, payload);
      } else {
        await client.put(`/courses/${id}/chapters/${chapterId}/`, payload);
      }
      navigate(`/instructor/courses/${id}`);
    } catch {
      setError("Could not save the chapter.");
    } finally {
      setBusy(false);
    }
  }

  if (!ready) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <h1>{isNew ? "New chapter" : "Edit chapter"}</h1>
      <form onSubmit={save}>
        <label>Chapter title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} required />

        <label>Content</label>
        <div className="editor-wrap">
          {/* key forces a fresh editor instance once the initial value is loaded */}
          <PlateEditor key={chapterId || "new"} value={content} onChange={setContent} />
        </div>

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
          />
          Make this chapter public (visible to students)
        </label>

        {error && <p className="error">{error}</p>}

        <div className="card-actions">
          <button className="btn-primary" disabled={busy}>
            {busy ? "Saving..." : "Save chapter"}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate(`/instructor/courses/${id}`)}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
