const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("../database/db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const TOTAL_LABS = 9;
const XP_PER_LAB = 100;

function getRank(totalXp, solvedCount) {
    if (solvedCount >= 9 || totalXp >= 900) return "VulnLab Expert";
    if (solvedCount >= 6 || totalXp >= 600) return "Pentester";
    if (solvedCount >= 3 || totalXp >= 300) return "Security Analyst";
    if (solvedCount >= 1 || totalXp >= 100) return "Beginner";

    return "New Learner";
}

// =====================
// GET PROFILE
// =====================

router.get(
    "/",
    authMiddleware,
    async (req, res) => {
        try {
            const result = await pool.query(
                `
                SELECT
                    users.id,
                    users.username,
                    users.email,
                    users.role,
                    COALESCE(users.bonus_xp, 0) AS bonus_xp,
                    COUNT(user_progress.lab_key) AS solved_count,
                    MAX(user_progress.solved_at) AS last_activity
                FROM users
                LEFT JOIN user_progress
                    ON users.id = user_progress.user_id
                    AND user_progress.solved = true
                WHERE users.id = $1
                GROUP BY
                    users.id,
                    users.username,
                    users.email,
                    users.role,
                    users.bonus_xp
                `,
                [req.user.id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    message: "User not found"
                });
            }

            const user = result.rows[0];

            const solvedCount = Number(user.solved_count);
            const bonusXp = Number(user.bonus_xp) || 0;
            const labXp = solvedCount * XP_PER_LAB;
            const totalXp = labXp + bonusXp;

            res.json({
                message: "Profile fetched successfully",
                profile: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    solvedCount,
                    totalLabs: TOTAL_LABS,
                    labXp,
                    bonusXp,
                    totalXp,
                    rank: getRank(totalXp, solvedCount),
                    lastActivity: user.last_activity
                }
            });

        } catch (err) {
            console.error("Profile fetch error:", err.message);

            res.status(500).json({
                message: "Server error"
            });
        }
    }
);

// =====================
// UPDATE PROFILE
// =====================

router.put(
    "/",
    authMiddleware,
    async (req, res) => {
        try {
            const {
                username,
                email
            } = req.body;

            if (!username || !email) {
                return res.status(400).json({
                    message: "Username and email are required"
                });
            }

            const existingUser = await pool.query(
                `
                SELECT id
                FROM users
                WHERE
                    (username = $1 OR email = $2)
                    AND id != $3
                `,
                [
                    username,
                    email,
                    req.user.id
                ]
            );

            if (existingUser.rows.length > 0) {
                return res.status(409).json({
                    message: "Username or email already exists"
                });
            }

            const updatedUser = await pool.query(
                `
                UPDATE users
                SET
                    username = $1,
                    email = $2
                WHERE id = $3
                RETURNING id, username, email, role
                `,
                [
                    username,
                    email,
                    req.user.id
                ]
            );

            res.json({
                message: "Profile updated successfully",
                user: updatedUser.rows[0]
            });

        } catch (err) {
            console.error("Profile update error:", err.message);

            res.status(500).json({
                message: "Server error"
            });
        }
    }
);

// =====================
// CHANGE PASSWORD
// =====================

router.put(
    "/password",
    authMiddleware,
    async (req, res) => {
        try {
            const {
                currentPassword,
                newPassword
            } = req.body;

            if (!currentPassword || !newPassword) {
                return res.status(400).json({
                    message: "Current password and new password are required"
                });
            }

            if (newPassword.length < 6) {
                return res.status(400).json({
                    message: "New password must be at least 6 characters"
                });
            }

            const userResult = await pool.query(
                "SELECT id, password FROM users WHERE id = $1",
                [req.user.id]
            );

            if (userResult.rows.length === 0) {
                return res.status(404).json({
                    message: "User not found"
                });
            }

            const user = userResult.rows[0];

            const isMatch = await bcrypt.compare(
                currentPassword,
                user.password
            );

            if (!isMatch) {
                return res.status(400).json({
                    message: "Current password is incorrect"
                });
            }

            const hashedPassword = await bcrypt.hash(
                newPassword,
                10
            );

            await pool.query(
                "UPDATE users SET password = $1 WHERE id = $2",
                [
                    hashedPassword,
                    req.user.id
                ]
            );

            res.json({
                message: "Password updated successfully"
            });

        } catch (err) {
            console.error("Password update error:", err.message);

            res.status(500).json({
                message: "Server error"
            });
        }
    }
);

module.exports = router;