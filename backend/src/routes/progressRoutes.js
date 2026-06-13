const express = require("express");
const pool = require("../database/db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const VALID_LABS = [
    "lab_sqli",
    "lab_xss",
    "lab_idor",
    "lab_jwt",
    "lab_path",
    "lab_csrf",
    "lab_cmdi",
    "lab_ssrf",
    "lab_upload"
];


// Save solved lab progress
router.post("/solve", authMiddleware, async (req, res) => {
    try {
        const { labKey } = req.body;

        if (!labKey) {
            return res.status(400).json({
                message: "Lab key is required"
            });
        }

        if (!VALID_LABS.includes(labKey)) {
            return res.status(400).json({
                message: "Invalid lab key"
            });
        }

        const result = await pool.query(
            `
            INSERT INTO user_progress (user_id, lab_key, solved)
            VALUES ($1, $2, true)
            ON CONFLICT (user_id, lab_key)
            DO UPDATE SET
                solved = true,
                solved_at = CURRENT_TIMESTAMP
            RETURNING *
            `,
            [req.user.id, labKey]
        );

        res.json({
            message: "Progress saved successfully",
            progress: result.rows[0]
        });

    } catch (err) {
        console.error("Progress save error:", err.message);

        res.status(500).json({
            message: "Server error"
        });
    }
});


// Get logged-in user's progress
router.get("/", authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            `
            SELECT lab_key, solved, solved_at
            FROM user_progress
            WHERE user_id = $1
            ORDER BY solved_at ASC
            `,
            [req.user.id]
        );

        res.json({
            message: "Progress fetched successfully",
            progress: result.rows
        });

    } catch (err) {
        console.error("Progress fetch error:", err.message);

        res.status(500).json({
            message: "Server error"
        });
    }
});


module.exports = router;