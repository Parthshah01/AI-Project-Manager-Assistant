import { useState } from "react";

const PLACEHOLDER = `Paste meeting notes or a task description, e.g.

"Sarah will finalize the Q3 budget by next Friday. This is high priority. \
Also, someone should review the vendor contracts when they get a chance."`;

export default function TaskInput({ onExtract, loading, error }) {
  const [text, setText] = useState("");

  const handleSubmit = () => {
    if (!text.trim() || loading) return;
    onExtract(text);
  };

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="panel">
      <div className="panel-label">Input</div>
      <textarea
        className="notes-input"
        placeholder={PLACEHOLDER}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <div className="actions-row">
        <span className="hint">⌘/Ctrl + Enter to extract</span>
        <button className="primary" onClick={handleSubmit} disabled={loading || !text.trim()}>
          {loading ? "Extracting…" : "Extract tasks"}
        </button>
      </div>
      {error && <div className="error-banner">{error}</div>}
    </div>
  );
}
