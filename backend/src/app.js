const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const fs = require("fs");
const pool = require("./database/db");

const authRoutes = require("./routes/authRoutes");
const progressRoutes = require("./routes/progressRoutes");
const leaderboardRoutes = require("./routes/leaderboardRoutes");
const adminRoutes = require("./routes/adminRoutes");
const profileRoutes = require("./routes/profileRoutes");

const sqliLabRoutes = require("./vulnerabilities/sqliLab");
const xssLabRoutes = require("./vulnerabilities/xssLab");
const idorLabRoutes = require("./vulnerabilities/idorLab");
const jwtLabRoutes = require("./vulnerabilities/jwtLab");
const pathTraversalLabRoutes = require("./vulnerabilities/pathTraversalLab");
const csrfLabRoutes = require("./vulnerabilities/csrfLab");
const commandInjectionLabRoutes = require("./vulnerabilities/commandInjectionLab");
const ssrfLabRoutes = require("./vulnerabilities/ssrfLab");
const fileUploadLabRoutes = require("./vulnerabilities/fileUploadLab");

const app = express();

// =====================
// Basic Application Logging
// =====================

const logDir = path.join(__dirname, "../logs");

if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

function logEvent(message) {
    const timestamp = new Date().toISOString();

    fs.appendFileSync(
        path.join(logDir, "app.log"),
        `[${timestamp}] ${message}\n`
    );
}

// =====================
// Middleware
// =====================

app.use(helmet({
    contentSecurityPolicy: false
}));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    logEvent(`${req.method} ${req.originalUrl} - IP: ${req.ip}`);
    next();
});

// =====================
// Frontend Static Files
// =====================

app.use(express.static(path.join(__dirname, "../../frontend")));

// =====================
// API Routes
// =====================

app.use("/api/auth", authRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/profile", profileRoutes);

app.use("/api/sqli", sqliLabRoutes);
app.use("/api/xss", xssLabRoutes);
app.use("/api/idor", idorLabRoutes);
app.use("/api/jwt", jwtLabRoutes);
app.use("/api/files", pathTraversalLabRoutes);
app.use("/api/csrf", csrfLabRoutes);
app.use("/api/cmdi", commandInjectionLabRoutes);
app.use("/api/ssrf", ssrfLabRoutes);
app.use("/api/upload", fileUploadLabRoutes);

// =====================
// Frontend Entry Route
// =====================

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../../frontend/index.html"));
});

// =====================
// Database Test
// =====================

pool.query("SELECT NOW()", (err, result) => {
    if (err) {
        console.error("Database connection error:", err);
    } else {
        console.log("Database connected:", result.rows[0]);
    }
});

// =====================
// Start Server
// =====================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});