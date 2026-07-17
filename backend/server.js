const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");

// =====================================================
// Load Environment Variables FIRST
// =====================================================
dotenv.config({
    path: path.join(__dirname, ".env")
});

// =====================================================
// Debug (Temporary)
// NOTE:
// Publish se pehle ye console.log remove kar denge.
// =====================================================
console.log(process.env.MONGO_URI);

console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("API Key:", process.env.CLOUDINARY_API_KEY);
console.log(
    "API Secret:",
    process.env.CLOUDINARY_API_SECRET ? "Loaded" : "Missing"
);

// =====================================================
// Import Database
// =====================================================
const connectDB = require("./config/db");

// =====================================================
// Import Routes
// =====================================================
const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const uploadRoutes = require("./routes/upload");

// ===============================
// Admin Routes (NEW)
// ===============================
const adminRoutes = require("./routes/admin");

// =====================================================
// Express App
// =====================================================
const app = express();

// =====================================================
// Connect MongoDB
// =====================================================
connectDB();

// =====================================================
// Global Middleware
// =====================================================
app.use(cors());
app.use(express.json());

// =====================================================
// API Routes
// =====================================================

// Authentication
app.use("/api/auth", authRoutes);

// Profile APIs
app.use("/api/profile", profileRoutes);

// Upload APIs
app.use("/api/upload", uploadRoutes);

// ===============================
// Admin APIs (NEW)
// ===============================
app.use("/api/admin", adminRoutes);

app.use(
    "/uploads",
    express.static(path.join(__dirname, "uploads"))
);

console.log("✅ Profile Routes Loaded");
console.log("✅ Admin Routes Loaded");

// =====================================================
// Home Route
// =====================================================
app.get("/", (req, res) => {
    res.json({
        app: "BmTheaterHub India",
        status: "Running"
    });
});

// =====================================================
// Start Server
// =====================================================
const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});