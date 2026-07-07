const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");

// =========================
// Load Environment Variables FIRST
// =========================
dotenv.config({
    path: path.join(__dirname, ".env")
});

// =========================
// Debug (Temporary)
// =========================
console.log(process.env.MONGO_URI);

console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("API Key:", process.env.CLOUDINARY_API_KEY);
console.log(
    "API Secret:",
    process.env.CLOUDINARY_API_SECRET ? "Loaded" : "Missing"
);

// =========================
// Import After dotenv
// =========================
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const uploadRoutes = require("./routes/upload");

// =========================
// App
// =========================
const app = express();

// =========================
// Database
// =========================
connectDB();

// =========================
// Middleware
// =========================
app.use(cors());
app.use(express.json());

// =========================
// Routes
// =========================
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/upload", uploadRoutes);

console.log("✅ Profile Routes Loaded");

// =========================
// Home Route
// =========================
app.get("/", (req, res) => {
    res.json({
        app: "BmTheaterHub India",
        status: "Running"
    });
});

// =========================
// Start Server
// =========================
const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});