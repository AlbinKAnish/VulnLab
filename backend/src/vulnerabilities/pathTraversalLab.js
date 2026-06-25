const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const labMode = process.env.LAB_MODE || "demo";
const filesDir = path.join(__dirname, "../../files");

// PATH TRAVERSAL LAB
// demo mode = safe allowlist
// vulnerable mode = intentionally vulnerable

router.get("/download", (req, res) => {
    const { file } = req.query;

    if (!file) {
        return res.status(400).json({
            message: "Missing file parameter"
        });
    }

    // =====================
    // DEMO MODE
    // =====================

    if (labMode === "demo") {
        const allowedFiles = [
            "welcome.txt",
            "manual.txt"
        ];

        if (!allowedFiles.includes(file)) {
            return res.status(400).json({
                mode: "demo",
                message: "Only demo files are allowed",
                allowedFiles
            });
        }

        const safeFilePath = path.join(filesDir, file);

        return fs.readFile(safeFilePath, "utf8", (err, data) => {
            if (err) {
                return res.status(404).json({
                    mode: "demo",
                    message: "File not found"
                });
            }

            res.type("text/plain");
            res.send(data);
        });
    }

    // =====================
    // VULNERABLE MODE
    // =====================

    const filePath = path.join(filesDir, file);

    fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
            return res.status(404).json({
                mode: "vulnerable",
                message: "File not found"
            });
        }

        res.type("text/plain");
        res.send(data);
    });
});

module.exports = router;