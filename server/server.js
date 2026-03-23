// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

// ✅ 1. Connect MongoDB (optional)
connectDB();

// ✅ 2. Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ 3. Safe GEMINI key check (NO CRASH)
if (!process.env.GEMINI_API_KEY) {
  console.warn("⚠️ GEMINI_API_KEY is missing. Fallback mode will be used.");
}

// ✅ 4. Global Logger (Improved)
app.use("/api", (req, res, next) => {
  console.log("\n📥 ===== Incoming Request =====");
  console.log("📍 URL:", req.originalUrl);
  console.log("📜 Method:", req.method);

  if (Object.keys(req.body || {}).length === 0) {
    console.log("📦 Body: ⚠️ EMPTY or NOT PARSED");
  } else {
    console.log("📦 Body:", req.body);
  }

  next();
});

// ✅ 5. Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api", require("./routes/analyze"));

// ✅ 6. Health check route
app.get("/", (req, res) => {
  res.send("🚀 Server is running and ready!");
});

// ✅ 7. 404 Handler (NEW)
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
  });
});

// ✅ 8. Global Error Handler
app.use((err, req, res, next) => {
  console.error("\n🔥 ===== SERVER ERROR =====");
  console.error("Message:", err.message);
  console.error("Stack:", err.stack);

  res.status(500).json({
    error: "Something went wrong on the server.",
  });
});

// ✅ 9. Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("\n🚀 ===== SERVER STARTED =====");
  console.log(`🌐 Running at: http://localhost:${PORT}`);
  console.log("🔑 GEMINI_API_KEY Loaded:", !!process.env.GEMINI_API_KEY);
});