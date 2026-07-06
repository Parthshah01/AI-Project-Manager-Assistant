import { useState } from "react";

function EditableRow({ task, onSave, onCancel }) {
  const [draft, setDraft] = useState({
    description: task.description,
    owner: task.owner || "",
    due_date: task.due_date || "",
    priority: task.priority,
    status: task.status,
  });

  const set = (key) => (e) => setDraft({ ...draft, [key]: e.target.value });

  return (
    <tr className="task-row">
      <td>
        <input className="edit-input" value={draft.description} onChange={set("description")} />
      </td>
      <td>
        <input className="edit-input" value={draft.owner} onChange={set("owner")} placeholder="Unassigned" />
      </td>
      <td>
        <input className="edit-input" value={draft.due_date} onChange={set("due_date")} placeholder="YYYY-MM-DD" />
      </td>
      <td>
        <select className="edit-input" value={draft.priority} onChange={set("priority")}>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </td>
      <td>
        <select className="edit-input" value={draft.status} onChange={set("status")}>
          <option value="To Do">To Do</option>
          <option value="In Progress">In Progress</option>
          <option value="Done">Done</option>
        </select>
      </td>
      <td>
        <div className="row-actions">
          <button className="primary" onClick={() => onSave(draft)}>
            Save
          </button>
          <button className="ghost" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </td>
    </tr>
  );
}

function DisplayRow({ task, onEdit, onDelete }) {
  return (
    <tr className={`task-row priority-${task.priority}`}>
      <td>
        {task.description}
      </td>
      <td>
        <span className="owner-tag">{task.owner || "Unassigned"}</span>
      </td>
      <td>
        <span className="due-date">{task.due_date || "—"}</span>
      </td>
      <td>
        <span className={`priority-pill ${task.priority}`}>{task.priority}</span>
      </td>
      <td>{task.status}</td>
      <td>
        <div className="row-actions">
          <button className="ghost" onClick={onEdit}>
            Edit
          </button>
          <button className="ghost danger" onClick={onDelete}>
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function TaskList({ tasks, onUpdate, onDelete }) {
  const [editingId, setEditingId] = useState(null);

  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        No tasks yet. Paste some notes above and hit "Extract tasks" to get started.
      </div>
    );
  }

  return (
    <table className="task-table">
      <thead>
        <tr>
          <th style={{ width: "34%" }}>Task</th>
          <th>Owner</th>
          <th>Due</th>
          <th>Priority</th>
          <th>Status</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {tasks.map((task) =>
          editingId === task.id ? (
            <EditableRow
              key={task.id}
              task={task}
              onCancel={() => setEditingId(null)}
              onSave={(patch) => {
                onUpdate(task.id, patch);
                setEditingId(null);
              }}
            />
          ) : (
            <DisplayRow
              key={task.id}
              task={task}
              onEdit={() => setEditingId(task.id)}
              onDelete={() => onDelete(task.id)}
            />
          )
        )}
      </tbody>
    </table>
  );
}
