import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext'; 
import {
  FaCheck,
  FaEdit,
  FaSpinner,
  FaExclamationTriangle,
  FaCalendarAlt,
} from 'react-icons/fa';

const TaskList = () => {
  const {
    tasks,
    loading,
    error,
    updateTask,
  } = useTasks();

  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '' });

  const startEditing = (task) => {
    setEditingTaskId(task._id);
    setEditForm({ title: task.title, description: task.description });
  };

  const cancelEditing = () => setEditingTaskId(null);

  const saveTask = async (taskId) => {
    if (!editForm.title.trim()) return alert('Title required');
    await updateTask(taskId, editForm);
    setEditingTaskId(null);
  };

  const toggleStatus = async (task) => {
    const newStatus = task.status === 'complete' ? 'incomplete' : 'complete';
    await updateTask(task._id, { status: newStatus });
  };

  const formatDate = (date) => new Date(date).toLocaleDateString();

  const getPriorityClasses = (priority) => {
    switch ((priority || '').toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="p-4 flex items-center"><FaSpinner className="animate-spin mr-2" />Loading tasks...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600 flex items-center"><FaExclamationTriangle className="mr-2" />{error}</div>;
  }

  if (!tasks.length) {
    return <div className="p-4 text-center">No tasks found</div>;
  }

  return (
    <div className="bg-white p-4 rounded shadow max-h-96 overflow-y-auto">
      <h3 className="text-lg font-semibold mb-4">Your Tasks</h3>
      <ul className="space-y-3">
        {tasks.map((task) => (
          <li key={task._id} className="border-b pb-3">
            {editingTaskId === task._id ? (
              <div className="space-y-2">
                <input
                  className="w-full border p-2 rounded"
                  value={editForm.title}
                  name="title"
                  onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                />
                <textarea
                  className="w-full border p-2 rounded"
                  value={editForm.description}
                  name="description"
                  rows="2"
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                />
                <div className="flex justify-end space-x-2">
                  <button onClick={cancelEditing} className="bg-gray-200 px-3 py-1 rounded">Cancel</button>
                  <button onClick={() => saveTask(task._id)} className="bg-blue-500 text-white px-3 py-1 rounded">Save</button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-start">
                  <h4 className={`font-medium ${task.status === 'complete' ? 'line-through text-gray-500' : ''}`}>{task.title}</h4>
                  <div className="flex space-x-2">
                    <button onClick={() => toggleStatus(task)} className="p-1 rounded bg-gray-100">
                      <FaCheck />
                    </button>
                    <button onClick={() => startEditing(task)} className="p-1 rounded bg-blue-100 text-blue-600">
                      <FaEdit />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                <div className="mt-2 flex justify-between text-xs">
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 rounded ${getPriorityClasses(task.priority)}`}>{task.priority}</span>
                    <span className={`px-2 py-1 rounded ${task.status === 'complete' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{task.status}</span>
                  </div>
                  {task.dueDate && (
                    <span className="text-gray-500 flex items-center">
                      <FaCalendarAlt className="mr-1" /> {formatDate(task.dueDate)}
                    </span>
                  )}
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
