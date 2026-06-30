const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const pool = require("./config/db");
const upload = require("./config/multer");

const app = express();

app.use(cors());
app.use(express.json());

// Log all incoming requests for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import routes
const authRoutes = require("./routes/auth");
const officeRoutes = require("./routes/offices");
const employeeRoutes = require("./routes/employees");
const inventoryRoutes = require("./routes/inventory");
const assetRoutes = require("./routes/assets");
const activityRoutes = require("./routes/activity");
const notificationRoutes = require("./routes/notifications");
const analyticsRoutes = require("./routes/analytics");
const { ssoLogin } = require("./controllers/authController");

// Test route
app.get("/", (req, res) => {
  res.send("Irshad & Company Internswal Overview API - Running");
});

// Neon DB test route
app.get("/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS current_time");

    res.json({
      success: true,
      message: "Database connected successfully",
      time: result.rows[0].current_time,
    });
  } catch (error) {
    console.error("DB Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message,
    });
  }
});

// File upload endpoint
app.post("/upload/profile-picture", upload.single('picture'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const fileUrl = `/uploads/profile-pictures/${req.file.filename}`;
    
    res.json({
      success: true,
      message: "File uploaded successfully",
      fileUrl: fileUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Error uploading file", error: error.message });
  }
});

// API Routes
app.get("/sso-login", ssoLogin);
app.use("/api/auth", authRoutes);
app.use("/api/offices", officeRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/analytics", analyticsRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
