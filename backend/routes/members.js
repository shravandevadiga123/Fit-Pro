const express = require('express');
const router = express.Router();
const db = require('../db');
const authenticate = require("../authMiddleware"); // ✅ import middleware

// 🔐 Protected route for testing
router.get("/protected", authenticate, (req, res) => {
  res.send("This is a protected route.");
});

// ✅ Create member (protected)
router.post('/', authenticate, async (req, res) => {
  const { name, email, phone, age, gender, address } = req.body;
  try {
    const [existing] = await db.query('SELECT * FROM members WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Member with this email already exists.' });
    }

    await db.query(
      'INSERT INTO members (name, email, phone, age, gender, address) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, phone, age, gender, address]
    );

    res.status(201).json({ message: '✅ Member registered successfully!' });
  } catch (err) {
    console.error('❌ Error registering member:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// 🔓 Query members (public)
router.get('/', async (req, res) => {
  const { name, age, gender } = req.query;

  let sql = "SELECT * FROM members WHERE 1=1";
  const params = [];

  if (name) {
    sql += " AND name LIKE ?";
    params.push(`%${name}%`);
  }

  if (age) {
    sql += " AND age = ?";
    params.push(age);
  }

  if (gender) {
    sql += " AND gender = ?";
    params.push(gender);
  }

  try {
    const [results] = await db.query(sql, params);
    res.json(results);
  } catch (err) {
    console.error("❌ Error fetching members:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// ✅ Delete member by ID and name (protected)
router.delete('/:id', authenticate, async (req, res) => {
  const memberId = req.params.id;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name is required to confirm deletion.' });
  }

  try {
    const [result] = await db.query(
      'DELETE FROM members WHERE id = ? AND name = ?',
      [memberId, name]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '❌ Member not found or name does not match.' });
    }

    res.json({ message: '🗑️ Member deleted successfully!' });
  } catch (err) {
    console.error('❌ Error deleting member:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// ✅ Update member (protected)
router.patch('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { name, age, gender, phone, email, address } = req.body;

  const fields = [];
  const values = [];

  if (name) {
    fields.push('name = ?');
    values.push(name);
  }
  if (age) {
    fields.push('age = ?');
    values.push(age);
  }
  if (gender) {
    fields.push('gender = ?');
    values.push(gender);
  }
  if (phone) {
    fields.push('phone = ?');
    values.push(phone);
  }
  if (email) {
    fields.push('email = ?');
    values.push(email);
  }
  if (address) {
    fields.push('address = ?');
    values.push(address);
  }

  if (fields.length === 0) {
    return res.status(400).json({ error: 'No fields provided for update' });
  }

  const sql = `UPDATE members SET ${fields.join(', ')} WHERE id = ?`;
  values.push(id);

  try {
    const [result] = await db.query(sql, values);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }
    res.json({ message: '✅ Member updated successfully!' });
  } catch (err) {
    console.error('❌ Error updating member:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
