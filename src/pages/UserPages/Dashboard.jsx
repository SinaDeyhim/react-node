import React, { useEffect, useState, useRef } from "react";
import { DndContext, closestCorners } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import UserSidebar from "./UserSidebar";
import Column from "./Column";
import SortableItem from "./SortableItem";
import notificationSound from "./notification.mp3";

import { useTasks } from "../../contexts/TasksContext";
import { useAuth } from "../../contexts/AuthContext";

const NOTES_API_BASE = "http://localhost:5000/api/notes";
let debounceTimer = null;

const UserDashboard = () => {
  const { tasks: allTasks, loading } = useTasks();
  const { user } = useAuth();

  const [grouped, setGrouped] = useState({
    "To Do": [],
    "In Progress": [],
    Completed: [],
  });

  const [notes, setNotes] = useState("");
  const audioRef = useRef(new Audio(notificationSound));

  // Categorize tasks
  useEffect(() => {
    if (loading || !allTasks.length) return;

    const categorized = {
      "To Do": allTasks.filter((t) => t.progress <= 40),
      "In Progress": allTasks.filter((t) => t.progress > 40 && t.progress <= 80),
      Completed: allTasks.filter((t) => t.progress > 80),
    };

    setGrouped(categorized);
    checkDeadlines(allTasks);
  }, [allTasks, loading]);

  // Fetch notes for logged in user
  useEffect(() => {
    if (!user?.id) return;
    fetch(`${NOTES_API_BASE}/${user.id}`)
      .then((res) => res.json())
      .then((data) => setNotes(data.notes || ""))
      .catch((err) => {
        console.error("Failed to fetch notes", err);
        toast.error("Could not load notes.");
      });
  }, [user?.id]);

  // Auto-save notes (debounced)
  useEffect(() => {
    if (!user?.id) return;
    if (debounceTimer) clearTimeout(debounceTimer);

    debounceTimer = setTimeout(() => {
      fetch(`${NOTES_API_BASE}/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      }).catch((err) => console.error("Failed to save notes", err));
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [notes, user?.id]);

  const checkDeadlines = (tasks) => {
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    tasks.forEach((task) => {
      if (task.deadline === today) {
        showNotification(`🚨 Task Due Today: "${task.title}"`, "bg-red-500 text-white");
      } else if (task.deadline === tomorrowStr) {
        showNotification(`⏳ Task Due Tomorrow: "${task.title}"`, "bg-yellow-500 text-black");
      }
    });
  };

  const showNotification = (message, bgClass) => {
    toast(
      <div className={`p-2 rounded-lg shadow-md font-semibold text-lg ${bgClass}`}>
        {message}
      </div>,
      { position: "top-right", autoClose: 5000, hideProgressBar: false }
    );
    audioRef.current.play();
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const sourceColumn = Object.keys(grouped).find((col) =>
      grouped[col].some((task) => task.id === active.id)
    );
    const targetColumn = Object.keys(grouped).find((col) =>
      grouped[col].some((task) => task.id === over.id)
    ) || over.id;

    if (!sourceColumn || !targetColumn || sourceColumn === targetColumn) return;

    setGrouped((prev) => {
      const updated = { ...prev };
      const moved = updated[sourceColumn].find((t) => t.id === active.id);
      updated[sourceColumn] = updated[sourceColumn].filter((t) => t.id !== active.id);
      updated[targetColumn] = [...updated[targetColumn], moved];
      return updated;
    });
  };

  const chartData = {
    labels: ["To Do", "In Progress", "Completed"],
    datasets: [
      {
        label: "Number of Tasks",
        data: [
          grouped["To Do"].length,
          grouped["In Progress"].length,
          grouped.Completed.length,
        ],
        backgroundColor: ["#FF6384", "#FFCE56", "#36A2EB"],
      },
    ],
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-100 to-gray-100">
      <UserSidebar />

      <div className="flex-1 p-6">
        <h2 className="text-4xl font-bold text-gray-900 mb-6 text-center bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
          🚀 User Dashboard
        </h2>
        <ToastContainer position="top-right" autoClose={5000} hideProgressBar />

        {/* Kanban Board */}
        <div className="glassmorphism p-4 rounded-xl shadow-lg bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-lg border border-white/20">
          <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.keys(grouped).map((columnKey) => (
                <Column key={columnKey} title={columnKey} id={columnKey} className="w-[280px]">
                  <SortableContext items={grouped[columnKey].map((task) => task.id)} strategy={verticalListSortingStrategy}>
                    {grouped[columnKey].map((task) => (
                      <SortableItem key={task.id} id={task.id} task={task} />
                    ))}
                  </SortableContext>
                </Column>
              ))}
            </div>
          </DndContext>
        </div>

        {/* Task Analytics & Notes */}
        <div className="mt-10 flex flex-col lg:flex-row items-start gap-6">
          <div className="p-6 w-full lg:w-1/2 bg-white shadow-lg rounded-xl border border-gray-300">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4 text-center tracking-wide uppercase">
              📊 Task Analytics
            </h2>
            <Bar data={chartData} />
          </div>

          <div className="p-6 w-full lg:w-[590px] bg-green-900 text-white rounded-xl border-[12px] border-[#8B4501] shadow-lg flex flex-col">
            <h2 className="text-2xl font-bold text-yellow-400 mb-2 text-center">📌 Notes</h2>
            <textarea
              className="flex-1 bg-transparent border-none outline-none text-white text-lg p-7"
              placeholder="Write your notes here..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              autoFocus
              style={{
                fontFamily: "Chalkduster, Comic Sans MS, cursive",
                height: "320px",
                minHeight: "280px",
                textAlign: "left",
                resize: "none",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
