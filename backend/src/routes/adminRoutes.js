const express = require("express");
const bcrypt = require("bcrypt");

const pool = require("../database/db");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

const TOTAL_LABS = 9;
const XP_PER_LAB = 100;

const labNames = {
    lab_sqli: "SQL Injection",
    lab_xss: "Stored XSS",
    lab_idor: "IDOR",
    lab_jwt: "JWT Privilege Escalation",
    lab_path: "Path Traversal",
    lab_csrf: "CSRF",
    lab_cmdi: "Command Injection",
    lab_ssrf: "SSRF",
    lab_upload: "File Upload"
};

function getRank(totalXp, solvedCount) {
    if (solvedCount >= 9 || totalXp >= 900) return "VulnLab Expert";
    if (solvedCount >= 6 || totalXp >= 600) return "Pentester";
    if (solvedCount >= 3 || totalXp >= 300) return "Security Analyst";
    if (solvedCount >= 1 || totalXp >= 100) return "Beginner";

    return "New Learner";
}

function escapeCsv(value) {
    if (value === null || value === undefined) {
        return "";
    }

    const stringValue = String(value);

    if (
        stringValue.includes(",") ||
        stringValue.includes('"') ||
        stringValue.includes("\n")
    ) {
        return `"${stringValue.replace(/"/g, '""')}"`;
    }

    return stringValue;
}

async function createAdminLog(adminId, targetUserId, action, details) {
    try {
        await pool.query(
            `
            INSERT INTO admin_logs
            (admin_id, target_user_id, action, details)
            VALUES ($1, $2, $3, $4)
            `,
            [
                adminId || null,
                targetUserId || null,
                action,
                details || null
            ]
        );
    } catch (err) {
        console.error("Admin log error:", err.message);
    }
}


// =====================
// Admin Overview
// =====================

router.get(
    "/overview",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {
        try {
            const usersResult = await pool.query(`
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
                GROUP BY
                    users.id,
                    users.username,
                    users.email,
                    users.role,
                    users.bonus_xp
                ORDER BY users.id ASC
            `);

            const users = usersResult.rows.map((user) => {
                const solvedCount = Number(user.solved_count);
                const bonusXp = Number(user.bonus_xp) || 0;
                const labXp = solvedCount * XP_PER_LAB;
                const xp = labXp + bonusXp;

                return {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    solvedCount,
                    totalLabs: TOTAL_LABS,
                    labXp,
                    bonusXp,
                    xp,
                    rank: getRank(xp, solvedCount),
                    status: "Active",
                    lastActivity: user.last_activity
                };
            });

            const totalUsers = users.length;

            const totalSolves = users.reduce(
                (sum, user) => sum + user.solvedCount,
                0
            );

            const totalXp = users.reduce(
                (sum, user) => sum + user.xp,
                0
            );

            const completionRate =
                totalUsers > 0
                    ? Math.round((totalSolves / (totalUsers * TOTAL_LABS)) * 100)
                    : 0;

            const topLearner =
                users.length > 0
                    ? [...users].sort((a, b) => b.xp - a.xp)[0]
                    : null;

            res.json({
                message: "Admin overview fetched successfully",
                stats: {
                    totalUsers,
                    totalSolves,
                    totalXp,
                    totalLabs: TOTAL_LABS,
                    topRank: topLearner ? topLearner.rank : "-",
                    completionRate,
                    topLearner: topLearner ? topLearner.username : "-"
                },
                users
            });

        } catch (err) {
            console.error("Admin overview error:", err.message);

            res.status(500).json({
                message: "Server error"
            });
        }
    }
);


// =====================
// Lab Analytics
// =====================

router.get(
    "/analytics",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {
        try {
            const totalUsersResult = await pool.query(
                "SELECT COUNT(*) FROM users"
            );

            const totalUsers = Number(totalUsersResult.rows[0].count);

            const progressResult = await pool.query(`
                SELECT lab_key, COUNT(*) AS solved
                FROM user_progress
                WHERE solved = true
                GROUP BY lab_key
            `);

            const solvedMap = {};

            progressResult.rows.forEach((row) => {
                solvedMap[row.lab_key] = Number(row.solved);
            });

            const analytics = Object.keys(labNames).map((key) => {
                const solved = solvedMap[key] || 0;

                const percentage =
                    totalUsers > 0
                        ? Math.round((solved / totalUsers) * 100)
                        : 0;

                return {
                    labKey: key,
                    name: labNames[key],
                    solved,
                    totalUsers,
                    percentage
                };
            });

            const sortedMost = [...analytics].sort(
                (a, b) => b.solved - a.solved
            );

            const sortedLeast = [...analytics].sort(
                (a, b) => a.solved - b.solved
            );

            res.json({
                message: "Analytics fetched successfully",
                analytics,
                mostSolvedLab: sortedMost[0]?.name || "-",
                leastSolvedLab: sortedLeast[0]?.name || "-"
            });

        } catch (err) {
            console.error("Admin analytics error:", err.message);

            res.status(500).json({
                message: "Server error"
            });
        }
    }
);


// =====================
// Lab Monitor
// =====================

router.get(
    "/lab-monitor",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {
        try {
            const result = await pool.query(`
                SELECT
                    users.id AS user_id,
                    users.username,
                    users.email,
                    user_progress.lab_key,
                    user_progress.solved_at
                FROM user_progress
                JOIN users
                    ON users.id = user_progress.user_id
                WHERE user_progress.solved = true
                ORDER BY user_progress.solved_at DESC
            `);

            const records = result.rows.map((row) => {
                return {
                    userId: row.user_id,
                    username: row.username,
                    email: row.email,
                    labKey: row.lab_key,
                    labName: labNames[row.lab_key] || row.lab_key,
                    solvedAt: row.solved_at
                };
            });

            res.json({
                message: "Lab monitor fetched successfully",
                totalRecords: records.length,
                records
            });

        } catch (err) {
            console.error("Lab monitor error:", err.message);

            res.status(500).json({
                message: "Server error"
            });
        }
    }
);


// =====================
// User Activity Feed
// =====================

router.get(
    "/activity",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {
        try {
            const result = await pool.query(`
                SELECT
                    users.username,
                    user_progress.lab_key,
                    user_progress.solved_at
                FROM user_progress
                JOIN users
                    ON users.id = user_progress.user_id
                WHERE user_progress.solved = true
                ORDER BY user_progress.solved_at DESC
                LIMIT 10
            `);

            const activity = result.rows.map((item) => {
                return {
                    username: item.username,
                    action: `Solved ${labNames[item.lab_key] || item.lab_key}`,
                    time: item.solved_at
                };
            });

            res.json({
                message: "Activity fetched successfully",
                activity
            });

        } catch (err) {
            console.error("Admin activity error:", err.message);

            res.status(500).json({
                message: "Server error"
            });
        }
    }
);


// =====================
// Admin Audit Logs
// =====================

router.get(
    "/logs",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {
        try {
            const result = await pool.query(`
                SELECT
                    admin_logs.id,
                    admin_logs.action,
                    admin_logs.details,
                    admin_logs.created_at,
                    admin_user.username AS admin_username,
                    target_user.username AS target_username
                FROM admin_logs
                LEFT JOIN users AS admin_user
                    ON admin_user.id = admin_logs.admin_id
                LEFT JOIN users AS target_user
                    ON target_user.id = admin_logs.target_user_id
                ORDER BY admin_logs.created_at DESC
                LIMIT 20
            `);

            res.json({
                message: "Admin logs fetched successfully",
                logs: result.rows
            });

        } catch (err) {
            console.error("Admin logs error:", err.message);

            res.status(500).json({
                message: "Server error"
            });
        }
    }
);


// =====================
// Export Users CSV
// =====================

router.get(
    "/export-users",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {
        try {
            const result = await pool.query(`
                SELECT
                    users.id,
                    users.username,
                    users.email,
                    users.role,
                    COALESCE(users.bonus_xp, 0) AS bonus_xp,
                    COUNT(user_progress.lab_key) AS solved_count
                FROM users
                LEFT JOIN user_progress
                    ON users.id = user_progress.user_id
                    AND user_progress.solved = true
                GROUP BY
                    users.id,
                    users.username,
                    users.email,
                    users.role,
                    users.bonus_xp
                ORDER BY users.id ASC
            `);

            let csv =
            "ID,Username,Email,Role,Solved Labs,Lab XP,Bonus XP,Total XP,Rank\n";

            result.rows.forEach((user) => {
                const solvedCount = Number(user.solved_count);
                const labXp = solvedCount * XP_PER_LAB;
                const bonusXp = Number(user.bonus_xp) || 0;
                const totalXp = labXp + bonusXp;
                const rank = getRank(totalXp, solvedCount);

                csv += [
                    user.id,
                    user.username,
                    user.email,
                    user.role,
                    `${solvedCount}/${TOTAL_LABS}`,
                    labXp,
                    bonusXp,
                    totalXp,
                    rank
                ].map(escapeCsv).join(",") + "\n";
            });

            await createAdminLog(
                req.user.id,
                null,
                "EXPORT_USERS",
                "Exported users CSV report"
            );

            res.header(
                "Content-Type",
                "text/csv"
            );

            res.attachment(
                "vulnlab_users_report.csv"
            );

            res.send(csv);

        } catch (err) {
            console.error("Export users error:", err.message);

            res.status(500).json({
                message: "Server error"
            });
        }
    }
);

// =====================
// Create User / Admin
// =====================

router.post(
    "/users",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {
        try {

            const {
                username,
                email,
                password,
                role
            } = req.body;

            if (
                !username ||
                !email ||
                !password ||
                !role
            ) {
                return res.status(400).json({
                    message:
                    "Username, email, password and role are required"
                });
            }

            const cleanRole =
            role.toLowerCase().trim();

            if (
                cleanRole !== "user" &&
                cleanRole !== "admin"
            ) {
                return res.status(400).json({
                    message:
                    "Role must be user or admin"
                });
            }

            const existingUser =
            await pool.query(
                `
                SELECT id
                FROM users
                WHERE username = $1
                OR email = $2
                `,
                [
                    username.trim(),
                    email.trim()
                ]
            );

            if (
                existingUser.rows.length > 0
            ) {
                return res.status(409).json({
                    message:
                    "Username or email already exists"
                });
            }

            const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );

            const result =
            await pool.query(
                `
                INSERT INTO users
                (
                    username,
                    email,
                    password,
                    role
                )
                VALUES
                (
                    $1,
                    $2,
                    $3,
                    $4
                )
                RETURNING
                id,
                username,
                email,
                role
                `,
                [
                    username.trim(),
                    email.trim(),
                    hashedPassword,
                    cleanRole
                ]
            );

            await createAdminLog(
                req.user.id,
                result.rows[0].id,
                "CREATE_USER",
                `Created ${cleanRole}: ${username}`
            );

            res.status(201).json({
                message:
                `${cleanRole} created successfully`,
                user:
                result.rows[0]
            });

        } catch (err) {

            console.error(
                "Create user error:",
                err.message
            );

            res.status(500).json({
                message:
                "Server error"
            });
        }
    }
);


// =====================
// Edit User
// =====================

router.put(
    "/users/:id",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {
        try {
            const userId = req.params.id;

            const {
                username,
                email,
                role
            } = req.body;

            if (!username || !email || !role) {
                return res.status(400).json({
                    message: "Username, email and role are required"
                });
            }

            if (role !== "user" && role !== "admin") {
                return res.status(400).json({
                    message: "Invalid role"
                });
            }

            const oldUserResult = await pool.query(
                "SELECT id, username, email, role FROM users WHERE id = $1",
                [userId]
            );

            if (oldUserResult.rows.length === 0) {
                return res.status(404).json({
                    message: "User not found"
                });
            }

            const oldUser = oldUserResult.rows[0];

            const existingUser = await pool.query(
                `
                SELECT id
                FROM users
                WHERE
                    (username = $1 OR email = $2)
                    AND id != $3
                `,
                [username, email, userId]
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
                    email = $2,
                    role = $3
                WHERE id = $4
                RETURNING
                    id,
                    username,
                    email,
                    role
                `,
                [
                    username,
                    email,
                    role,
                    userId
                ]
            );

            await createAdminLog(
                req.user.id,
                userId,
                "EDIT_USER",
                `Updated ${oldUser.username}: username ${oldUser.username} → ${username}, email ${oldUser.email} → ${email}, role ${oldUser.role} → ${role}`
            );

            res.json({
                message: "User updated successfully",
                user: updatedUser.rows[0]
            });

        } catch (err) {
            console.error("Update user error:", err.message);

            res.status(500).json({
                message: "Server error"
            });
        }
    }
);


// =====================
// Grant XP
// =====================

router.post(
    "/users/:id/grant-xp",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {
        try {
            const userId = req.params.id;
            const { xp } = req.body;

            const xpAmount = Number(xp);

            if (!xpAmount || xpAmount <= 0) {
                return res.status(400).json({
                    message: "XP amount must be greater than 0"
                });
            }

            if (xpAmount > 1000) {
                return res.status(400).json({
                    message: "You can grant a maximum of 1000 XP at a time"
                });
            }

            const userResult = await pool.query(
                "SELECT id, username, bonus_xp FROM users WHERE id = $1",
                [userId]
            );

            if (userResult.rows.length === 0) {
                return res.status(404).json({
                    message: "User not found"
                });
            }

            const targetUser = userResult.rows[0];

            const updatedUser = await pool.query(
                `
                UPDATE users
                SET bonus_xp = COALESCE(bonus_xp, 0) + $1
                WHERE id = $2
                RETURNING
                    id,
                    username,
                    email,
                    role,
                    bonus_xp
                `,
                [xpAmount, userId]
            );

            await createAdminLog(
                req.user.id,
                userId,
                "GRANT_XP",
                `Granted ${xpAmount} XP to ${targetUser.username}`
            );

            res.json({
                message: "XP granted successfully",
                user: updatedUser.rows[0]
            });

        } catch (err) {
            console.error("Grant XP error:", err.message);

            res.status(500).json({
                message: "Server error"
            });
        }
    }
);

// =====================
// Reset User Password
// =====================

router.put(
    "/users/:id/password",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {
        try {
            const userId = req.params.id;
            const { newPassword } = req.body;

            if (!newPassword) {
                return res.status(400).json({
                    message: "New password is required"
                });
            }

            if (newPassword.length < 8) {
                return res.status(400).json({
                    message: "Password must be at least 8 characters"
                });
            }

            const userResult = await pool.query(
                "SELECT id, username, email FROM users WHERE id = $1",
                [userId]
            );

            if (userResult.rows.length === 0) {
                return res.status(404).json({
                    message: "User not found"
                });
            }

            const targetUser = userResult.rows[0];

            const hashedPassword = await bcrypt.hash(
                newPassword,
                10
            );

            await pool.query(
                `
                UPDATE users
                SET password = $1
                WHERE id = $2
                `,
                [hashedPassword, userId]
            );

            await createAdminLog(
                req.user.id,
                userId,
                "RESET_PASSWORD",
                `Reset password for ${targetUser.username} (${targetUser.email})`
            );

            res.json({
                message: "User password reset successfully"
            });

        } catch (err) {
            console.error("Reset password error:", err.message);

            res.status(500).json({
                message: "Server error"
            });
        }
    }
);

// =====================
// Delete User
// =====================

router.delete(
    "/users/:id",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {
        try {
            const userId = req.params.id;

            if (Number(userId) === req.user.id) {
                return res.status(400).json({
                    message: "You cannot delete your own admin account"
                });
            }

            const userResult = await pool.query(
                "SELECT id, username, email FROM users WHERE id = $1",
                [userId]
            );

            if (userResult.rows.length === 0) {
                return res.status(404).json({
                    message: "User not found"
                });
            }

            const targetUser = userResult.rows[0];

            await createAdminLog(
                req.user.id,
                userId,
                "DELETE_USER",
                `Deleted user ${targetUser.username} (${targetUser.email})`
            );

            await pool.query(
                "DELETE FROM user_progress WHERE user_id = $1",
                [userId]
            );

            await pool.query(
                "DELETE FROM users WHERE id = $1",
                [userId]
            );

            res.json({
                message: "User deleted successfully"
            });

        } catch (err) {
            console.error("Delete user error:", err.message);

            res.status(500).json({
                message: "Server error"
            });
        }
    }
);


// =====================
// Reset User Progress + Bonus XP
// =====================

router.delete(
    "/users/:id/progress",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {
        try {
            const userId = req.params.id;

            const userResult = await pool.query(
                "SELECT id, username FROM users WHERE id = $1",
                [userId]
            );

            if (userResult.rows.length === 0) {
                return res.status(404).json({
                    message: "User not found"
                });
            }

            const targetUser = userResult.rows[0];

            await pool.query(
                "DELETE FROM user_progress WHERE user_id = $1",
                [userId]
            );

            await pool.query(
                "UPDATE users SET bonus_xp = 0 WHERE id = $1",
                [userId]
            );

            await createAdminLog(
                req.user.id,
                userId,
                "RESET_PROGRESS",
                `Reset progress and bonus XP for ${targetUser.username}`
            );

            res.json({
                message: "User progress and bonus XP reset successfully"
            });

        } catch (err) {
            console.error("Reset progress error:", err.message);

            res.status(500).json({
                message: "Server error"
            });
        }
    }
);


module.exports = router;