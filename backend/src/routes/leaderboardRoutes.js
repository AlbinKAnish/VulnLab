const express = require("express");
const pool = require("../database/db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const TOTAL_LABS = 9;
const XP_PER_LAB = 100;

function getRank(completed) {
    if (completed >= 9) {
        return "VulnLab Expert";
    }

    if (completed >= 6) {
        return "Pentester";
    }

    if (completed >= 3) {
        return "Security Analyst";
    }

    if (completed >= 1) {
        return "Beginner";
    }

    return "New Learner";
}

router.get("/", authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                users.id,
                users.username,
                users.email,
                COUNT(user_progress.lab_key) AS solved_labs,
                MAX(user_progress.solved_at) AS last_solved
            FROM users
            LEFT JOIN user_progress
                ON users.id = user_progress.user_id
                AND user_progress.solved = true
            GROUP BY users.id, users.username, users.email
            ORDER BY solved_labs DESC, last_solved ASC NULLS LAST
        `);

        const leaderboard = result.rows.map((user, index) => {
            const solvedLabs = Number(user.solved_labs);
            const xp = solvedLabs * XP_PER_LAB;
            const completion = Math.round((solvedLabs / TOTAL_LABS) * 100);

            return {
                position: index + 1,
                userId: user.id,
                username: user.username,
                email: user.email,
                solvedLabs,
                totalLabs: TOTAL_LABS,
                completion,
                xp,
                rank: getRank(solvedLabs),
                lastSolved: user.last_solved
            };
        });

        res.json({
            message: "Leaderboard fetched successfully",
            leaderboard
        });

    } catch (err) {
        console.error("Leaderboard error:", err.message);

        res.status(500).json({
            message: "Server error"
        });
    }
});

module.exports = router;