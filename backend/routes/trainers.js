const express = require('express');
const router = express.Router();
const db = require('../db');
const authenticate = require("../authMiddleware"); // ✅ Middleware for protected routes

// 🔐 Test protected route
router.get("/protected", authenticate, (req, res) => {
  res.send("This is a protected route.");
});

// 1️⃣ Add a Trainer (Protected)
router.post('/', authenticate, async (req, res) => {
  const { name, specialty, phone, email } = req.body;
  try {
    const [existing] = await db.query('SELECT * FROM trainers WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Trainer with this email already exists.' });
    }

    await db.query(
      'INSERT INTO trainers (name, specialty, phone, email) VALUES (?, ?, ?, ?)',
      [name, specialty, phone, email]
    );

    res.status(201).json({ message: '✅ Trainer added successfully!' });
  } catch (err) {
    console.error('❌ Error adding trainer:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// 2️⃣ Get/Search Trainers (Public)
router.get('/', async (req, res) => {
  const { name, specialty } = req.query;

  let sql = "SELECT * FROM trainers WHERE 1=1";
  const params = [];

  if (name) {
    sql += " AND name LIKE ?";
    params.push(`%${name}%`);
  }

  if (specialty) {
    sql += " AND specialty LIKE ?";
    params.push(`%${specialty}%`);
  }

  try {
    const [results] = await db.query(sql, params);
    res.json(results);
  } catch (err) {
    console.error("❌ Error fetching trainers:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// 3️⃣ Update Trainer (Protected)
router.patch('/:id', authenticate, async (req, res) => {
  const trainerId = req.params.id;
  const { name, specialty, phone, email } = req.body;

  try {
    const [rows] = await db.query('SELECT * FROM trainers WHERE id = ?', [trainerId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Trainer not found' });
    }

    const trainer = rows[0];
    const updatedTrainer = {
      name: name || trainer.name,
      specialty: specialty || trainer.specialty,
      phone: phone || trainer.phone,
      email: email || trainer.email,
    };

    await db.query(
      'UPDATE trainers SET name = ?, specialty = ?, phone = ?, email = ? WHERE id = ?',
      [updatedTrainer.name, updatedTrainer.specialty, updatedTrainer.phone, updatedTrainer.email, trainerId]
    );

    res.json({ message: '✅ Trainer updated successfully!' });
  } catch (err) {
    console.error('❌ Error updating trainer:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// 4️⃣ Delete Trainer (Protected)
router.delete('/:id', authenticate, async (req, res) => {
  const trainerId = req.params.id;

  try {
    const [result] = await db.query('DELETE FROM trainers WHERE id = ?', [trainerId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Trainer not found' });
    }

    res.json({ message: '🗑️ Trainer deleted successfully!' });
  } catch (err) {
    console.error('❌ Error deleting trainer:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
