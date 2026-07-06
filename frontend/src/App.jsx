import { useState } from "react";
import Header from "./components/Header";
import MeetingInput from "./components/MeetingInput";
import DashboardCards from "./components/DashboardCards";
import TaskList from "./components/TaskList";

export default function App() {
  // Real tasks state (starts empty)
  const [tasks, setTasks] = useState([]);

  // Called after AI extracts tasks
  const handleExtract = (extractedTasks) => {
    const formattedTasks = extractedTasks.map((task, index) => ({
      id: task.id ?? index + 1,
      description: task.description || "",
      owner: task.owner || "",
      due_date: task.due_date || "",
      priority: task.priority || "Medium",
      status: task.status || "To Do",
      source_note: task.source_note || "",
    }));

    setTasks(formattedTasks);
  };

  // Update Task
  const handleUpdate = (id, patch) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, ...patch } : task
      )
    );
  };

  // Delete Task
  const handleDelete = (id) => {
    setTasks((prev) =>
      prev.filter((task) => task.id !== id)
    );
  };

  // Export CSV
  const handleExport = () => {
    window.open("http://127.0.0.1:8000/tasks/export/csv", "_blank");
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Header />

      <div className="max-w-7xl mx-auto p-8">

        {/* Meeting Notes */}
        <MeetingInput onExtract={handleExtract} />

        {/* Dashboard */}
        <DashboardCards tasks={tasks} />

        {/* Task Section */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mt-8">

          {/* Heading + Export Button */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              Extracted Tasks
            </h2>

            {tasks.length > 0 && (
              <button
                onClick={handleExport}
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg transition"
              >
                ⬇ Export CSV
              </button>
            )}
          </div>

          {tasks.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <h3 className="text-2xl font-semibold mb-3">
                No Tasks Yet
              </h3>

              <p>
                Paste your meeting notes above and click
                <span className="font-semibold text-indigo-600">
                  {" "}Extract Tasks
                </span>.
              </p>
            </div>
          ) : (
            <TaskList
              tasks={tasks}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          )}

        </div>
      </div>
    </div>
  );
}