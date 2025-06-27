const express = require("express");
const router = express.Router();
const db = require("../db");
const authenticate = require("../authMiddleware");

// 🔐 Protected route
router.get("/protected", authenticate, (req, res) => {
  res.send("This is a protected route.");
});

// ✅ POST: Mark attendance (Protected)
router.post("/", authenticate, async (req, res) => {
  const { member_id, class_id } = req.body;

  if (!member_id || !class_id) {
    return res.status(400).json({ error: "member_id and class_id are required." });
  }

  try {
    const [existing] = await db.query(
      "SELECT * FROM attendance WHERE member_id = ? AND class_id = ?",
      [member_id, class_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: "This member is already marked present for this class." });
    }

    await db.query(
      "INSERT INTO attendance (member_id, class_id) VALUES (?, ?)",
      [member_id, class_id]
    );

    res.status(201).json({ message: "✅ Attendance recorded." });
  } catch (err) {
    console.error("❌ Error marking attendance:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// 🔍 GET: Fetch attendance records
router.get("/", async (req, res) => {
  const { member_id, class_id } = req.query;

  let sql = `
    SELECT 
      a.id,
      m.id AS member_id,
      m.name AS member_name,
      c.id AS class_id,
      c.title AS class_title,
      c.schedule,
      c.end_time,
      a.attended_on
    FROM attendance a
    JOIN members m ON a.member_id = m.id
    JOIN classes c ON a.class_id = c.id
    WHERE 1=1
  `;
  const params = [];

  if (member_id) {
    sql += " AND a.member_id = ?";
    params.push(member_id);
  }

  if (class_id) {
    sql += " AND a.class_id = ?";
    params.push(class_id);
  }

  try {
    const [results] = await db.query(sql, params);
    res.json(results);
  } catch (err) {
    console.error("❌ Error fetching attendance:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// ✏️ PATCH: Update attendance (Protected)
router.patch("/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  const { member_id, class_id } = req.body;

  if (!member_id && !class_id) {
    return res.status(400).json({ error: "Nothing to update." });
  }

  try {
    const [current] = await db.query("SELECT * FROM attendance WHERE id = ?", [id]);
    if (current.length === 0) {
      return res.status(404).json({ error: "Attendance record not found." });
    }

    const existing = current[0];
    const newMemberId = member_id || existing.member_id;
    const newClassId = class_id || existing.class_id;

    const [duplicates] = await db.query(
      "SELECT * FROM attendance WHERE member_id = ? AND class_id = ? AND id != ?",
      [newMemberId, newClassId, id]
    );

    if (duplicates.length > 0) {
      return res.status(400).json({ error: "This member is already marked for this class." });
    }

    let sql = "UPDATE attendance SET ";
    const params = [];

    if (member_id) {
      sql += "member_id = ?, ";
      params.push(member_id);
    }

    if (class_id) {
      sql += "class_id = ?, ";
      params.push(class_id);
    }

    sql = sql.slice(0, -2) + " WHERE id = ?";
    params.push(id);

    const [result] = await db.query(sql, params);
    res.json({ message: "✅ Attendance updated." });
  } catch (err) {
    console.error("❌ Error updating attendance:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// 🗑️ DELETE: Remove attendance (Protected)
router.delete("/:id", authenticate, async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query("DELETE FROM attendance WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Attendance record not found." });
    }

    res.json({ message: "🗑️ Attendance deleted successfully." });
  } catch (err) {
    console.error("❌ Error deleting attendance:", err);
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;
