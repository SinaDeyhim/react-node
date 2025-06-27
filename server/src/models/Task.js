const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
  deadline: String,
  progress: { type: Number, default: 0 },
  assignedTo: { type: String, required: true }, // Can be user email or name
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);
