const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const authenticate = require("../authMiddleware"); // ✅ import your middleware

// 🔐 Protected route for testing or admin-only actions
router.get("/protected", authenticate, (req, res) => {
  res.send("This is a protected route.");
});

require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 🔐 Signup Route
router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const [existing] = await db.query("SELECT * FROM admins WHERE email = ?", [email]);
    if (existing.length > 0) return res.status(400).json({ error: "Email already in use." });

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    await db.query(
      "INSERT INTO admins (username, email, password, verified, verification_token) VALUES (?, ?, ?, ?, ?)",
      [username, email, hashedPassword, 0, verificationToken]
    );

    const verificationLink = `${process.env.BASE_URL}/api/auth/verify?token=${verificationToken}`;

    await transporter.sendMail({
      to: email,
      subject: "Verify Your FitPro Manager Account",
      html: `<h2>Welcome ${username}!</h2><p>Click below to verify your account:</p><a href="${verificationLink}">Verify Account</a>`,
    });

    res.status(201).json({ message: "✅ Signup successful! Please check your email to verify." });
  } catch (err) {
    console.error("❌ Signup error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✉️ Email Verification Route
router.get("/verify", async (req, res) => {
  const { token } = req.query;

  try {
    const [rows] = await db.query("SELECT * FROM admins WHERE verification_token = ?", [token]);
    if (rows.length === 0) return res.status(400).send("Invalid or expired token");

    await db.query(
      "UPDATE admins SET verified = 1, verification_token = NULL WHERE verification_token = ?",
      [token]
    );

    res.send("✅ Email verified successfully. You can now log in.");
  } catch (err) {
    console.error("❌ Verification error:", err);
    res.status(500).send("Server error");
  }
});

// 🔐 Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const [admins] = await db.query("SELECT * FROM admins WHERE email = ?", [email]);

    if (admins.length === 0) {
      return res.status(400).json({ error: "No account found with that email." });
    }

    const admin = admins[0];

    if (!admin.verified) {
      return res.status(403).json({ error: "Please verify your email before logging in." });
    }

    const passwordMatch = await bcrypt.compare(password, admin.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid password." });
    }

    // ✅ include username in the JWT payload
    const token = jwt.sign(
      { id: admin.id, email: admin.email, username: admin.username },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.json({ message: "✅ Login successful!", token });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


router.post("/request-reset", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required." });

  try {
    const [admins] = await db.query("SELECT * FROM admins WHERE email = ?", [email]);
    if (admins.length === 0) return res.status(404).json({ error: "No admin with this email." });

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 3600000); // 1 hour
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      "UPDATE admins SET reset_token = ?, reset_token_expiry = ?, temp_password = ? WHERE email = ?",
      [token, expiry, hashedPassword, email]
    );

    const resetLink = `${process.env.BASE_URL}/api/auth/confirm-reset/${token}`;

    await transporter.sendMail({
      from: `"FitPro Manager" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "🔐 Confirm Password Reset",
      html: `<p>You requested to reset your password. Click the link below to confirm:</p>
             <a href="${resetLink}">Confirm Reset</a>`
    });

    res.json({ message: "✅ Reset confirmation link sent to your email." });
  } catch (err) {
    console.error("❌ Error in request-reset:", err);
    res.status(500).json({ error: "Server error." });
  }
});

router.get("/confirm-reset/:token", async (req, res) => {
  const { token } = req.params;

  try {
    const [admins] = await db.query(
      "SELECT * FROM admins WHERE reset_token = ? AND reset_token_expiry > NOW()",
      [token]
    );

    if (admins.length === 0) return res.status(400).send("Invalid or expired token.");

    const admin = admins[0];

    await db.query(
      "UPDATE admins SET password = ?, reset_token = NULL, reset_token_expiry = NULL, temp_password = NULL WHERE id = ?",
      [admin.temp_password, admin.id]
    );

    res.send("✅ Your password has been reset successfully. You can now log in.");
  } catch (err) {
    console.error("❌ Confirm reset error:", err);
    res.status(500).send("Server error.");
  }
});

// 📍 New route to check if user is verified
// ✅ is-verified route
router.get("/is-verified", async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: "Email required" });

  try {
    const [rows] = await db.query(
      "SELECT * FROM admins WHERE email = ?",
      [email]
    );

    if (rows.length === 0) return res.json({ verified: false });

    const user = rows[0];
    const isSignupCheck = !user.reset_token; // reset_token is NULL after password reset
    const isVerified = user.verified === 1;

    res.json({ verified: isVerified && isSignupCheck }); // only true if signup complete OR reset finished
  } catch (err) {
    console.error("Verification check failed:", err);
    res.status(500).json({ error: "Server error" });
  }
});


module.exports = router;
