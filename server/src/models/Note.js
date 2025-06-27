// models/Note.js
const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
  userId: { type: String, required: true },  // ✅ changed from ObjectId to String
  content: { type: String, default: "" },
});

module.exports = mongoose.model("Note", noteSchema);

