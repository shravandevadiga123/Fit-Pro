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
    if (existing.length > 0) {
      return res.status(400).json({ error: "Email already in use." });
    }

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
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
          <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 10px; padding: 30px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); text-align: center;">

            <div style="margin-bottom: 20px;">
              <img src="https://fit-pro-manager.vercel.app/Email-logo.png" alt="FitPro Manager Logo" style="max-width: 150px;" />
            </div>

            <h2 style="color: #2c3e50;">Welcome to FitPro Manager, ${username}!</h2>
            
            <p style="font-size: 16px; color: #555; line-height: 1.6;">
              Thank you for signing up. To get started, please verify your email address by clicking the button below.
            </p>

            <div style="margin: 30px 0;">
              <a href="${verificationLink}" 
                 style="background-color: #1abc9c; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold; display: inline-block;">
                Verify Your Account
              </a>
            </div>

            <p style="font-size: 15px; color: #333; line-height: 1.6;">
              After verification, please visit our website and log in to start managing your fitness operations more effectively.
            </p>

            <p style="font-size: 13px; color: #888;">
              If you did not create this account, you can safely ignore this email.
            </p>

            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />

            <p style="font-size: 13px; color: #aaa;">
              Thanks,<br>The FitPro Manager Team
            </p>

          </div>
        </div>
      `
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

//reset password
router.post("/request-reset", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required." });

  try {
    const [admins] = await db.query("SELECT * FROM admins WHERE email = ?", [email]);
    if (admins.length === 0) return res.status(404).json({ error: "No admin with this email." });

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 60000); // 1 min
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
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
          <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 10px; padding: 30px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">

            <div style="text-align: center; margin-bottom: 20px;">
              <img src="https://fit-pro-manager.vercel.app/Email-logo.png" alt="FitPro Manager Logo" style="max-width: 150px;" />
            </div>

            <h2 style="color: #2c3e50; text-align: center;">Reset Your Password</h2>

            <p style="font-size: 16px; color: #555; line-height: 1.6; text-align: center;">
              You requested to reset your password. To confirm this action, please click the button below within the next hour.
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" 
                 style="background-color: #e67e22; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold; display: inline-block;">
                Confirm Password Reset
              </a>
            </div>

            <p style="font-size: 15px; color: #333; line-height: 1.6; text-align: center;">
              If you did not request this reset, you can safely ignore this email and your password will remain unchanged.
            </p>

            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />

            <p style="font-size: 13px; color: #aaa; text-align: center;">
              Stay Fit,<br>The FitPro Manager Team
            </p>

          </div>
        </div>
      `
    });

    res.json({ message: "✅ Reset confirmation link sent to your email." });
  } catch (err) {
    console.error("❌ Error in request-reset:", err);
    res.status(500).json({ error: "Server error." });
  }
});

//reset verify
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

//upadate username
router.patch("/update-username", authenticate, async (req, res) => {
  const { username } = req.body;
  const adminId = req.admin.id; // ✅ correct variable from auth middleware

  if (!username) {
    return res.status(400).json({ error: "Username is required." });
  }

  try {
    await db.query("UPDATE admins SET username = ? WHERE id = ?", [username, adminId]);
    res.json({ message: "✅ Username updated successfully." });
  } catch (err) {
    console.error("❌ Error updating username:", err);
    res.status(500).json({ error: "Server error." });
  }
});

//update password
router.patch("/change-password", authenticate, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const adminId = req.admin.id; // ✅ use same naming

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Current and new password are required." });
  }

  try {
    const [rows] = await db.query("SELECT * FROM admins WHERE id = ?", [adminId]);
    if (rows.length === 0) return res.status(404).json({ error: "Admin not found." });

    const admin = rows[0];

    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) return res.status(401).json({ error: "Current password is incorrect." });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query("UPDATE admins SET password = ? WHERE id = ?", [hashedPassword, adminId]);

    res.json({ message: "✅ Password changed successfully." });
  } catch (err) {
    console.error("❌ Change password error:", err);
    res.status(500).json({ error: "Server error." });
  }
});

module.exports = router;
