const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// PATH TRAVERSAL LAB - intentionally vulnerable download route
router.get("/download", (req, res) => {
    const { file } = req.query;

    if (!file) {
        return res.status(400).json({
            message: "Missing file parameter"
        });
    }

    const filePath = path.join(__dirname, "../../files", file);

    fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
            return res.status(404).json({
                message: "File not found"
            });
        }

        res.type("text/plain");
        res.send(data);
    });
});

module.exports = router;