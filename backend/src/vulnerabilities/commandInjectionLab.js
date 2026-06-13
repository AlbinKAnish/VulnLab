const express = require("express");
const { exec } = require("child_process");

const router = express.Router();

// COMMAND INJECTION LAB - intentionally vulnerable
router.post("/ping", (req, res) => {
    const { host } = req.body;

    if (!host) {
        return res.status(400).json({
            message: "Host is required"
        });
    }

    const command = `ping -n 2 ${host}`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({
                message: "Command execution failed",
                error: stderr || error.message
            });
        }

        res.json({
            message: "Ping executed",
            command,
            output: stdout
        });
    });
});

module.exports = router;
