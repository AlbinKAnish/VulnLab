const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const pool = require("../database/db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// =====================
// Rate Limiters
// =====================

const userLoginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        message: "Too many user login attempts. Please try again after 15 minutes."
    },
    standardHeaders: true,
    legacyHeaders: false
});

const adminLoginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 3,
    message: {
        message: "Too many admin login attempts. Please try again after 15 minutes."
    },
    standardHeaders: true,
    legacyHeaders: false
});

const registerLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        message: "Too many registration attempts. Please try again after 15 minutes."
    },
    standardHeaders: true,
    legacyHeaders: false
});

// =====================
// Helper: Create JWT
// =====================

function createToken(user) {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d"
        }
    );
}

// =====================
// Register Route
// =====================

router.post("/register", registerLimiter, async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                message: "Username, email and password are required"
            });
        }

        const existingUser = await pool.query(
            "SELECT id FROM users WHERE username = $1 OR email = $2",
            [username, email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await pool.query(
            `
            INSERT INTO users
            (username, email, password, role)
            VALUES ($1, $2, $3, 'user')
            RETURNING id, username, email, role
            `,
            [
                username.trim(),
                email.trim(),
                hashedPassword
            ]
        );

        res.status(201).json({
            message: "User registered successfully",
            user: newUser.rows[0]
        });

    } catch (err) {
        console.error("Register error:", err.message);

        res.status(500).json({
            message: "Server Error"
        });
    }
});

// =====================
// User Login Route
// Only normal users can login here
// =====================

router.post("/login", userLoginLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const userResult = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email.trim()]
        );

        if (userResult.rows.length === 0) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        const user = userResult.rows[0];

        if (user.role !== "user") {
            return res.status(403).json({
                message: "Please use the admin login page"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        const token = createToken(user);

        res.json({
            message: "User login successful",
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });

    } catch (err) {
        console.error("User login error:", err.message);

        res.status(500).json({
            message: "Server Error"
        });
    }
});

// =====================
// Admin Login Route
// Only admins can login here
// =====================

router.post("/admin-login", adminLoginLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const userResult = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email.trim()]
        );

        if (userResult.rows.length === 0) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        const user = userResult.rows[0];

        if (user.role !== "admin") {
            return res.status(403).json({
                message: "Admin access only"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        const token = createToken(user);

        res.json({
            message: "Admin login successful",
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });

    } catch (err) {
        console.error("Admin login error:", err.message);

        res.status(500).json({
            message: "Server Error"
        });
    }
});

// =====================
// Protected Profile Route
// =====================

router.get("/profile", authMiddleware, async (req, res) => {
    try {
        const userResult = await pool.query(
            "SELECT id, username, email, role FROM users WHERE id = $1",
            [req.user.id]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json({
            message: "Profile accessed successfully",
            user: userResult.rows[0]
        });

    } catch (err) {
        console.error("Auth profile error:", err.message);

        res.status(500).json({
            message: "Server Error"
        });
    }
});

module.exports = router;