const express = require("express");
const pool = require("../database/db");

const router = express.Router();

// VULNERABLE LOGIN ROUTE
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // intentionally vulnerable query
        const query = `SELECT * FROM users WHERE email = '${email}' AND password = '${password}'`;

        console.log("Executing Query:", query);

        const result = await pool.query(query);

        if (result.rows.length > 0) {
            return res.json({
                message: "Login successful (Vulnerable Lab)",
                user: {
                    id: result.rows[0].id,
                    username: result.rows[0].username,
                    email: result.rows[0].email
                }
            });
        }

        return res.status(401).json({
            message: "Invalid email or password"
        });

    } catch (err) {
        console.error("SQLi Lab Error:", err.message);
        return res.status(500).json({
            message: "Server Error",
            error: err.message
        });
    }
});

module.exports = router;