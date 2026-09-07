const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");

const app = express();
const clientPath = path.join(__dirname, "../client");

if (process.env.MONGODB_URI) {
  connectDB();
} else {
  console.log(
    "MongoDB URI not configured. Running without database connection.",
  );
}

// Middleware
app.use(cors());
app.use(express.json());
// Simple request logger to help debug why some paths return 404 in browsers
app.use((req, res, next) => {
  console.log(new Date().toISOString(), req.method, req.originalUrl);
  next();
});
app.use(express.static(clientPath));

// Explicitly serve auth pages to avoid client-side routing issues
app.get("/login.html", (req, res) => {
  res.sendFile(path.join(clientPath, "login.html"));
});

app.get("/register.html", (req, res) => {
  res.sendFile(path.join(clientPath, "register.html"));
});

// Auth routes
app.use("/api/auth", authRoutes);

// Health route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Notes App API is running 🚀" });
});

// Catch-all for non-API routes (exclude paths starting with /api)
app.get(/^\/(?!api).*/, (req, res) => {
  return res.sendFile(path.join(clientPath, "index.html"));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
