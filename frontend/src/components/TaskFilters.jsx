export default function TaskFilters({ filters, onChange, owners, taskCount, onExportCsv }) {
  const update = (key) => (e) => onChange({ ...filters, [key]: e.target.value });

  return (
    <div className="filters-row">
      <div className="filters-group">
        <select value={filters.owner} onChange={update("owner")}>
          <option value="">All owners</option>
          {owners.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>

        <select value={filters.status} onChange={update("status")}>
          <option value="">All statuses</option>
          <option value="To Do">To Do</option>
          <option value="In Progress">In Progress</option>
          <option value="Done">Done</option>
        </select>

        <select value={filters.priority} onChange={update("priority")}>
          <option value="">All priorities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span className="task-count">{taskCount} task{taskCount === 1 ? "" : "s"}</span>
        <button onClick={onExportCsv}>Export CSV</button>
      </div>
    </div>
  );
}
