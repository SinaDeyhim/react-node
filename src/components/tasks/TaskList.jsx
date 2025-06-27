import React, { useState, useEffect } from "react";
import {
  FaCheck,
  FaEdit,
  FaSpinner,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaFlag,
} from "react-icons/fa";

const API_BASE = "http://localhost:5000/api/tasks";
const USER_ID = localStorage.getItem("userId");

const fallbackTasks = [
  {
    _id: "1",
    title: "Complete project documentation",
    description: "Write comprehensive documentation for the TaskFlow project",
    status: "incomplete",
    priority: "high",
    dueDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    _id: "2",
    title: "Fix navigation bug",
    description: "Address the issue with sidebar navigation on mobile devices",
    status: "complete",
    priority: "medium",
    dueDate: new Date().toISOString(),
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    _id: "3",
    title: "Implement user feedback",
    description: "Add the user feedback form to the dashboard",
    status: "incomplete",
    priority: "low",
    dueDate: new Date(Date.now() + 86400000).toISOString(),
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    priority: "",
    dueDate: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch(`${API_BASE}/${USER_ID}`);
        if (!res.ok) throw new Error("API response not ok");
        const data = await res.json();
        setTasks(data);
        setError(null);
      } catch (err) {
        console.error("Falling back to mock data due to error:", err.message);
        setTasks(fallbackTasks);
        setError("Server unavailable. Using fallback tasks.");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const handleStatusChange = async (taskId) => {
    const task = tasks.find((t) => t._id === taskId);
    const updatedStatus = task.status === "complete" ? "incomplete" : "complete";

    try {
      const res = await fetch(`${API_BASE}/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: updatedStatus }),
      });
      if (!res.ok) throw new Error("Failed to update task");
      const updatedTask = await res.json();
      setTasks((prev) => prev.map((t) => (t._id === taskId ? updatedTask : t)));
    } catch (err) {
      console.error("Failed to update status:", err.message);
    }
  };

  const startEditing = (task) => {
    setEditingTask(task._id);
    setEditForm({
      title: task.title || "",
      description: task.description || "",
      priority: task.priority || "",
      dueDate: task.dueDate?.substring(0, 10) || "", // trim for input[type=date]
    });
  };

  const saveTask = async (taskId) => {
    if (!editForm.title.trim()) {
      alert("Title cannot be empty");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (!res.ok) throw new Error("Failed to update task");
      const updated = await res.json();
      setTasks((prev) => prev.map((t) => (t._id === taskId ? updated : t)));
      setEditingTask(null);
    } catch (err) {
      console.error("Save failed:", err.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const cancelEditing = () => setEditingTask(null);

  const getPriorityClasses = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="p-4 flex justify-center items-center">
        <FaSpinner className="animate-spin text-blue-500 text-2xl" />
        <span className="ml-2">Loading tasks...</span>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow max-h-96 overflow-y-auto">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Your Tasks</h3>
      {error && (
        <div className="mb-2 text-red-500 flex items-center">
          <FaExclamationTriangle className="mr-2" />
          <span>{error}</span>
        </div>
      )}
      <ul className="space-y-3">
        {tasks.map((task) => (
          <li key={task._id} className="border-b pb-3">
            {editingTask === task._id ? (
              <div className="space-y-2">
                <input
                  name="title"
                  value={editForm.title}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded text-gray-600 font-semibold"
                  placeholder="Title"
                />
                <textarea
                  name="description"
                  value={editForm.description}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded text-gray-600"
                  placeholder="Description"
                />
                <select
                  name="priority"
                  value={editForm.priority}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded text-gray-600"
                >
                  <option value="">Select priority</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <input
                  type="date"
                  name="dueDate"
                  value={editForm.dueDate}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded text-gray-600"
                />
                <div className="flex justify-end gap-2">
                  <button onClick={cancelEditing} className="px-3 py-1 bg-gray-200 rounded">
                    Cancel
                  </button>
                  <button
                    onClick={() => saveTask(task._id)}
                    className="px-3 py-1 bg-blue-500 text-white rounded"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-start">
                  <h4
                    className={`font-medium ${
                      task.status === "complete"
                        ? "line-through text-gray-500"
                        : "text-gray-800"
                    }`}
                  >
                    {task.title}
                  </h4>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatusChange(task._id)}
                      className="p-1 rounded bg-gray-100 text-gray-600"
                    >
                      <FaCheck />
                    </button>
                    <button
                      onClick={() => startEditing(task)}
                      className="p-1 rounded bg-blue-100 text-blue-600"
                    >
                      <FaEdit />
                    </button>
                  </div>
                </div>
                <p className={`text-sm mt-1 ${task.status === "complete" ? "text-gray-400" : "text-gray-600"}`}>
                  {task.description}
                </p>
                <div className="flex justify-between mt-2 items-center">
                  <span className={`text-xs px-2 py-1 rounded ${getPriorityClasses(task.priority)}`}>
                    {task.priority}
                  </span>
                  <span className="text-xs text-gray-500">
                    <FaCalendarAlt className="inline mr-1" />{" "}
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}
                  </span>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskList;
