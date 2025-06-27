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
import { TASK_API_BASE } from "./UserPage";
import notificationSound from "./notification.mp3";

const NOTES_API_BASE = "http://localhost:5000/api/notes"; // adjust to your backend route
let debounceTimer = null;

const UserDashboard = () => {
  const [tasks, setTasks] = useState({
    "To Do": [],
    "In Progress": [],
    Completed: [],
  });

  const [notes, setNotes] = useState("");
  const audioRef = useRef(new Audio(notificationSound));

  useEffect(() => {
    window.scrollTo(0, 0);
    const userId = localStorage.getItem("userId");
    if (userId) {
      fetchTasks(userId);
      fetchUserNotes(userId);
    }
  }, []);

  const fetchTasks = async (userId) => {
    try {
      const res = await fetch(`${TASK_API_BASE}/${userId}`);
      const allTasks = await res.json();

      const categorized = {
        "To Do": allTasks.filter((t) => t.progress <= 40),
        "In Progress": allTasks.filter((t) => t.progress > 40 && t.progress <= 80),
        Completed: allTasks.filter((t) => t.progress > 80),
      };

      setTasks(categorized);
      checkDeadlines(allTasks);
    } catch (err) {
      console.error("Failed to fetch tasks", err);
      toast.error("Could not load tasks.");
    }
  };

  const fetchUserNotes = async (userId) => {
    try {
      const res = await fetch(`${NOTES_API_BASE}/${userId}`);
      const data = await res.json();
      setNotes(data.notes || "");
    } catch (err) {
      console.error("Failed to fetch notes", err);
      toast.error("Could not load notes.");
    }
  };

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    if (debounceTimer) clearTimeout(debounceTimer);

    debounceTimer = setTimeout(async () => {
      try {
        await fetch(`${NOTES_API_BASE}/${userId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notes }),
        });
      } catch (err) {
        console.error("Failed to save notes", err);
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [notes]);

  const checkDeadlines = (allTasks) => {
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    allTasks.forEach((task) => {
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

    const sourceColumn = Object.keys(tasks).find((col) =>
      tasks[col].some((task) => task.id === active.id)
    );
    const targetColumn = Object.keys(tasks).find((col) =>
      tasks[col].some((task) => task.id === over.id)
    ) || over.id;

    if (!sourceColumn || !targetColumn || sourceColumn === targetColumn) return;

    setTasks((prev) => {
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
          tasks["To Do"].length,
          tasks["In Progress"].length,
          tasks.Completed.length,
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
              {Object.keys(tasks).map((columnKey) => (
                <Column key={columnKey} title={columnKey} id={columnKey} className="w-[280px]">
                  <SortableContext items={tasks[columnKey].map((task) => task.id)} strategy={verticalListSortingStrategy}>
                    {tasks[columnKey].map((task) => (
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
