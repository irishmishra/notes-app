const crypto = require("crypto");
global.crypto = crypto;

const express = require("express");
const cors = require("cors");
const path = require("path");

require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");

const app = express();

const clientPath = path.join(__dirname, "../client");

const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

if (mongoUri) {
  connectDB();
} else {
  console.log(
    "MongoDB URI not configured. Running without database connection.",
  );
}

// Middleware
app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(new Date().toISOString(), req.method, req.originalUrl);
  next();
});

// Static files
app.use(express.static(clientPath));

// Auth pages
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
  res.json({
    status: "ok",
    message: "Notes App API is running 🚀",
  });
});

// Catch-all route
app.get(/^\/(?!api).*/, (req, res) => {
  return res.sendFile(path.join(clientPath, "index.html"));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
