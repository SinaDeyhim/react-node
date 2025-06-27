const express = require("express");
const router = express.Router();
const Note = require("../models/Note");

// GET notes for user
router.get("/:userId", async (req, res) => {
  try {
    let note = await Note.findOne({ userId: req.params.userId });
    if (!note) note = await Note.create({ userId: req.params.userId, content: "" });
    res.json({ notes: note.content });
  } catch (err) {
    console.error("GET /api/notes/:userId error:", err);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
});


// PUT update note for user
router.put("/:userId", async (req, res) => {
  try {
    const updated = await Note.findOneAndUpdate(
      { userId: req.params.userId },
      { content: req.body.notes },
      { new: true, upsert: true }
    );
    res.json({ notes: updated.content });
  } catch (err) {
    res.status(500).json({ error: "Failed to update notes" });
  }
});

module.exports = router;
