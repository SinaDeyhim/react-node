import React, { createContext, useContext, useEffect, useState } from "react";

import { useAuth } from "../contexts/AuthContext";

const TaskContext = createContext();
const API_BASE = "http://localhost:5000/api/tasks";

export const TaskProvider = ({ userId, children }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();


  const fetchTasks = async () => {
    try {
      const res = await fetch(`${API_BASE}/${user.id}`);
      if (!res.ok) throw new Error("Failed to fetch tasks");
      const data = await res.json();
      setTasks(data);
      setError(null);
    } catch (err) {
      setError("Failed to load tasks");
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async (taskId, updates) => {
    try {
      const res = await fetch(`${API_BASE}/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update task");
      const updated = await res.json();
      setTasks(prev => prev.map(t => (t._id === taskId ? updated : t)));
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await fetch(`${API_BASE}/${taskId}`, { method: "DELETE" });
      setTasks(prev => prev.filter(t => t._id !== taskId));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const addTask = async (task) => {
    try {
      const res = await fetch(`${API_BASE}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task),
      });
      const newTask = await res.json();
      setTasks(prev => [newTask, ...prev]);
    } catch (err) {
      console.error("Create failed:", err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [userId]);

  return (
    <TaskContext.Provider value={{ tasks, loading, error, fetchTasks, updateTask, deleteTask, addTask }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => useContext(TaskContext);
