const express = require("express");
const { exec, execFile } = require("child_process");

const router = express.Router();

router.post("/ping", (req, res) => {
    const { host } = req.body;

    if (!host) {
        return res.status(400).json({
            message: "Host is required"
        });
    }

    const labMode = process.env.LAB_MODE || "demo";

    // =====================================
    // DEMO MODE (Safe for Portfolio)
    // =====================================

    if (labMode === "demo") {

        const cleanHost = String(host).trim();

        const allowedHosts = [
            "localhost",
            "127.0.0.1",
            "google.com",
            "example.com"
        ];

        if (!allowedHosts.includes(cleanHost)) {
            return res.status(400).json({
                message: "Only demo hosts are allowed",
                allowedHosts
            });
        }

        const isWindows = process.platform === "win32";

        const args = isWindows
            ? ["-n", "2", cleanHost]
            : ["-c", "2", cleanHost];

        execFile("ping", args, { timeout: 5000 }, (error, stdout, stderr) => {

            if (error) {
                return res.status(500).json({
                    message: "Ping failed",
                    error: stderr || error.message
                });
            }

            res.json({
                mode: "demo",
                message: "Safe demo ping executed",
                command: `ping ${args.join(" ")}`,
                output: stdout
            });
        });

    }

    // =====================================
    // VULNERABLE MODE (Teacher Testing)
    // =====================================

    else {

        const command = `ping -n 2 ${host}`;

        exec(command, (error, stdout, stderr) => {

            if (error) {
                return res.status(500).json({
                    message: "Command execution failed",
                    error: stderr || error.message
                });
            }

            res.json({
                mode: "vulnerable",
                message: "Command executed",
                command,
                output: stdout
            });
        });
    }
});

module.exports = router;