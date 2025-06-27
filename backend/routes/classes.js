const express = require("express");
const router = express.Router();
const db = require("../db");
const authenticate = require("../authMiddleware"); // ✅ middleware

// 🔐 Test protected route
router.get("/protected", authenticate, (req, res) => {
  res.send("This is a protected route.");
});

// ➕ Add a class (Protected)
router.post("/", authenticate, async (req, res) => {
  const { title, schedule, end_time, trainer_id } = req.body;

  try {
    const start = new Date(schedule);
    const end = new Date(end_time);
    const dateOnly = start.toISOString().split("T")[0];

    const [existing] = await db.query(
      `SELECT * FROM classes 
       WHERE trainer_id = ? 
         AND DATE(schedule) = ? 
         AND schedule < ? 
         AND end_time > ?`,
      [trainer_id, dateOnly, end, start]
    );

    if (existing.length > 0) {
      const conflict = existing[0];
      return res.status(400).json({
        error: "Trainer already has a scheduled class during this time.",
        class_id: conflict.id,
        title: conflict.title,
        schedule: conflict.schedule,
        end_time: conflict.end_time
      });
    }

    await db.query(
      "INSERT INTO classes (title, schedule, end_time, trainer_id) VALUES (?, ?, ?, ?)",
      [title, schedule, end_time, trainer_id]
    );

    res.status(201).json({ message: "✅ Class scheduled successfully!" });
  } catch (err) {
    console.error("❌ Error scheduling class:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// 📄 Get all or filtered classes (Public)
router.get("/", async (req, res) => {
  const { title, trainer_id } = req.query;

  let sql = `
    SELECT 
      c.*, 
      t.name AS trainer_name 
    FROM classes c
    JOIN trainers t ON c.trainer_id = t.id
    WHERE 1=1
  `;
  const params = [];

  if (title) {
    sql += " AND c.title LIKE ?";
    params.push(`%${title}%`);
  }

  if (trainer_id) {
    sql += " AND c.trainer_id = ?";
    params.push(trainer_id);
  }

  sql += " ORDER BY c.schedule ASC";

  try {
    const [classes] = await db.query(sql, params);
    res.json(classes);
  } catch (err) {
    console.error("❌ Error fetching filtered classes:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// ✏️ Update class (Protected)
router.patch("/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  const { title, schedule, end_time, trainer_id } = req.body;

  try {
    if ((schedule && end_time && trainer_id)) {
      const [conflicts] = await db.query(
        `SELECT id, title, schedule, end_time FROM classes 
         WHERE trainer_id = ? AND id != ? AND (
           (? < end_time AND ? > schedule)
         )`,
        [trainer_id, id, schedule, end_time]
      );

      if (conflicts.length > 0) {
        return res.status(409).json({
          error: "Trainer already has a class during the given time.",
          existing_class: conflicts[0],
        });
      }
    }

    let sql = "UPDATE classes SET ";
    const params = [];
    if (title) sql += "title = ?, ", params.push(title);
    if (schedule) sql += "schedule = ?, ", params.push(schedule);
    if (end_time) sql += "end_time = ?, ", params.push(end_time);
    if (trainer_id) sql += "trainer_id = ?, ", params.push(trainer_id);

    if (params.length === 0) {
      return res.status(400).json({ error: "No fields provided to update." });
    }

    sql = sql.slice(0, -2) + " WHERE id = ?";
    params.push(id);

    const [result] = await db.query(sql, params);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Class not found" });
    }

    res.json({ message: "✅ Class updated successfully!" });
  } catch (err) {
    console.error("❌ Error updating class:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// ❌ Delete class (Protected)
router.delete("/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query("DELETE FROM classes WHERE id = ?", [id]);
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Class not found" });

    res.json({ message: "🗑️ Class deleted successfully!" });
  } catch (err) {
    console.error("❌ Error deleting class:", err);
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;
