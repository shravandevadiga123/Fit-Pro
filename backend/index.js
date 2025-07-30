require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./db");

const memberRoutes = require("./routes/members");
const trainerRoutes = require("./routes/trainers");
const classRoutes = require("./routes/classes");
const attendanceRoutes = require("./routes/attendance");
const authRoutes = require("./routes/auth");

const app = express();
const PORT = process.env.PORT || 5006;

// ✅ Middlewares
app.use(cors());
app.use(express.json());

// ✅ API Routes
app.use("/api/members", memberRoutes);
app.use("/api/trainers", trainerRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/auth", authRoutes);

// ✅ DB Test on Startup
(async () => {
  try {
    await db.query("SELECT 1");
    console.log("✅ Connected to Aiven MySQL");
  } catch (err) {
    console.error("❌ DB connection error:", err);
    process.exit(1);
  }
})();

//pinging
app.get('/', (req, res) => {
  res.status(200).send('Backend is ok!');
});

//pinging route 
app.get('/health', (req, res) => {
  res.status(200).send('Backend is alive!');
});

// ✅ Root Route (for testing)
app.get("/api", (req, res) => {
  res.send("FitPro Manager backend is working 🎉");
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
