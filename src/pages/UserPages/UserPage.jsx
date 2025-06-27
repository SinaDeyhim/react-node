import React, { useState, useEffect } from "react";
import UserSidebar from "./UserSidebar";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../../contexts/AuthContext";
import { useTasks } from "../../contexts/TasksContext";
import Dropdown from "../../components/common/Dropdown";

const FILTER_OPTIONS = ["All", "Completed", "Incomplete"];

const UserPage = () => {
  const { user } = useAuth();
  const { tasks, addTask, deleteTask, updateTask, fetchTasks, loading } = useTasks();

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "Medium",
    deadline: "",
    progress: 0,
  });

  const [searchTerm, setSearchTerm] = useState(() => localStorage.getItem("taskSearch") || "");
  const [filter, setFilter] = useState(() => localStorage.getItem("taskFilter") || "All");

  useEffect(() => {
    if (user?.id) {
      fetchTasks();
    } else {
      toast.error("User not found. Please log in again.");
    }
  }, [user?.id]);

  useEffect(() => {
    localStorage.setItem("taskSearch", searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    console.log(">>>> filter", filter)
    localStorage.setItem("taskFilter", filter);
  }, [filter]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim() || !newTask.description.trim()) {
      return toast.error("Title and description are required.");
    }

    try {
      await addTask({ ...newTask, assignedTo: user.id });
      toast.success("Task added successfully ✅");
      setNewTask({
        title: "",
        description: "",
        priority: "Medium",
        deadline: "",
        progress: 0,
      });
    } catch (err) {
      toast.error("Failed to add task.");
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(taskId);
      toast.success("Task removed 🗑️");
    } catch (err) {
      toast.error("Failed to delete task.");
    }
  };

  const updateProgress = async (taskId, progress) => {
    try {
      await updateTask(taskId, { progress: parseInt(progress) });
    } catch (err) {
      toast.error("Failed to update progress.");
    }
  };

  const getPriorityColor = (priority) => {
    if (priority === "High") return "text-red-600 font-bold";
    if (priority === "Medium") return "text-yellow-600 font-bold";
    return "text-green-600 font-bold";
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
    const isCompleted = task.status === "complete" || task.progress >= 100;

    if (filter === "Completed") return isCompleted && matchesSearch;
    if (filter === "Incomplete") return !isCompleted && matchesSearch;
    return matchesSearch;
  });

  return (
    <div className="flex min-h-screen bg-gray-100">
      <UserSidebar />
      <div className="flex-1 p-6">
        <h1 className="text-4xl font-bold mb-6 text-center">
          🎯{" "}
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
            User Task Management
          </span>
        </h1>

        <ToastContainer position="top-right" autoClose={3000} />

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 max-w-4xl mx-auto">
          <input
            type="text"
            placeholder="🔍 Search by title"
            className="w-full md:w-1/2 p-3 border rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

        <Dropdown
          value={filter}
          options={FILTER_OPTIONS}
          onChange={setFilter}
          className="w-full md:w-1/3"
         />
        </div>

        {/* Create Task */}
        <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Create a New Task</h2>
          <form onSubmit={handleCreateTask} className="space-y-4">
            <input
              type="text"
              placeholder="Task title"
              className="w-full p-3 border rounded-lg"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              required
            />
            <textarea
              placeholder="Description"
              className="w-full p-3 border rounded-lg"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              required
            />
            <div className="flex gap-4">
              <select
                className="w-1/2 p-3 border rounded-lg"
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
              >
                <option value="High">🔥 High</option>
                <option value="Medium">⚡ Medium</option>
                <option value="Low">✅ Low</option>
              </select>
              <input
                type="date"
                className="w-1/2 p-3 border rounded-lg"
                value={newTask.deadline}
                onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-all"
            >
              ➕ Add Task
            </button>
          </form>
        </div>

        {/* Task List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <p>Loading...</p>
          ) : filteredTasks.length === 0 ? (
            <p className="text-gray-600">No matching tasks found.</p>
          ) : (
            filteredTasks.map((task) => (
              <div key={task._id} className="bg-white p-4 rounded shadow border-l-4 border-blue-400">
                <h3 className="text-lg font-semibold">{task.title}</h3>
                <p className="text-gray-600">{task.description}</p>
                <span className={`text-sm ${getPriorityColor(task.priority)}`}>
                  Priority: {task.priority}
                </span>
                <p className="text-sm text-gray-700 mt-1">
                  <strong>Assigned To:</strong> {task.assignedTo}
                </p>
                <p className="text-sm text-gray-700 mt-1">
                  <strong>Deadline:</strong> {task.deadline}
                </p>
                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-700">Progress:</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={task.progress}
                    onChange={(e) => updateProgress(task._id, e.target.value)}
                    className="w-full mt-2"
                  />
                  <span className="text-sm text-gray-700">{task.progress}% Completed</span>
                </div>
                <button
                  onClick={() => handleDeleteTask(task._id)}
                  className="mt-4 w-full bg-red-600 text-white p-2 rounded-lg hover:bg-red-700"
                >
                  🗑️ Delete Task
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default UserPage;
