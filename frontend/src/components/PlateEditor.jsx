import { Plate, PlateContent, usePlateEditor } from "@udecode/plate/react";
import {
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin,
  CodePlugin,
} from "@udecode/plate-basic-marks/react";

// An empty Plate document is a single empty paragraph.
export const EMPTY_VALUE = [{ type: "p", children: [{ text: "" }] }];

const plugins = [BoldPlugin, ItalicPlugin, UnderlinePlugin, CodePlugin];

function Toolbar({ editor }) {
  const mark = (key) => (e) => {
    e.preventDefault(); // keep the editor selection
    editor.tf.toggleMark(key);
  };
  const btn = {
    padding: "4px 10px",
    marginRight: 6,
    border: "1px solid #cbd5e1",
    borderRadius: 6,
    background: "#fff",
    cursor: "pointer",
  };
  return (
    <div style={{ marginBottom: 8 }}>
      <button type="button" style={{ ...btn, fontWeight: 700 }} onMouseDown={mark("bold")}>
        B
      </button>
      <button type="button" style={{ ...btn, fontStyle: "italic" }} onMouseDown={mark("italic")}>
        I
      </button>
      <button type="button" style={{ ...btn, textDecoration: "underline" }} onMouseDown={mark("underline")}>
        U
      </button>
      <button type="button" style={{ ...btn, fontFamily: "monospace" }} onMouseDown={mark("code")}>
        {"</>"}
      </button>
    </div>
  );
}

/**
 * Plate.js rich-text editor.
 * - readOnly=false: editable, calls onChange with the document value.
 * - readOnly=true: renders the stored value as read-only content (student view).
 */
export default function PlateEditor({ value, onChange, readOnly = false }) {
  const editor = usePlateEditor({
    plugins,
    value: value && value.length ? value : EMPTY_VALUE,
  });

  return (
    <Plate
      editor={editor}
      onChange={({ value }) => onChange && onChange(value)}
      readOnly={readOnly}
    >
      {!readOnly && <Toolbar editor={editor} />}
      <PlateContent
        readOnly={readOnly}
        placeholder={readOnly ? "" : "Write your chapter content..."}
        style={{
          minHeight: readOnly ? "auto" : 220,
          padding: readOnly ? 0 : 12,
          border: readOnly ? "none" : "1px solid #cbd5e1",
          borderRadius: 8,
          outline: "none",
          lineHeight: 1.6,
        }}
      />
    </Plate>
  );
}
