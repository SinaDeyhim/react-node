const express = require('express');
const router = express.Router();
const Task = require('../models/Task');



// Get tasks for a specific user
router.get('/:userId', async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.params.userId });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Get single task by ID
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});


// Create task
router.post('/', async (req, res) => {
  try {
    const task = new Task(req.body);
    const saved = await task.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create task' });
  }
});

// Delete task
router.delete('/:id', async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed' });
  }
});

// ✅ General-purpose update task route (can update any field)
router.put('/:id', async (req, res) => {
  try {
    const updated = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },     // Only update provided fields
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(updated);
  } catch (err) {
    console.error('Update failed:', err);
    res.status(500).json({ error: 'Update failed' });
  }
});

// Optional: keep this if you want separate progress-only route
// Otherwise, you can remove this if using the general PUT above
router.put('/:id/progress', async (req, res) => {
  try {
    const updated = await Task.findByIdAndUpdate(
      req.params.id,
      { progress: req.body.progress },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
});

module.exports = router;
