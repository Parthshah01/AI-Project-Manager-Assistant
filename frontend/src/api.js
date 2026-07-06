const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function handle(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed with status ${res.status}`);
  }
  return res.json();
}

export const api = {
  extract: (text) =>
    fetch(`${BASE_URL}/extract`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    }).then(handle),

  listTasks: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => v && params.append(k, v));
    const qs = params.toString();
    return fetch(`${BASE_URL}/tasks${qs ? `?${qs}` : ""}`).then(handle);
  },

  updateTask: (id, patch) =>
    fetch(`${BASE_URL}/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    }).then(handle),

  deleteTask: (id) =>
    fetch(`${BASE_URL}/tasks/${id}`, { method: "DELETE" }).then(handle),

  exportCsvUrl: () => `${BASE_URL}/tasks/export/csv`,
};
