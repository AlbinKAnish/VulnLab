const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// IDOR LAB - exposed chat transcript files
router.get("/chat/:filename", (req, res) => {
    const { filename } = req.params;

    // Allow only transcript files like 1.txt, 2.txt, 3.txt
    const isValidTranscript =
        /^[0-9]+\.txt$/.test(filename);

    if (!isValidTranscript) {
        return res.status(400).json({
            message: "Invalid transcript filename"
        });
    }

    const transcriptsDir = path.join(
        __dirname,
        "../../transcripts"
    );

    const transcriptPath = path.join(
        transcriptsDir,
        filename
    );

    fs.readFile(transcriptPath, "utf8", (err, data) => {
        if (err) {
            return res.status(404).json({
                message: "Transcript not found"
            });
        }

        res.type("text/plain");
        res.send(data);
    });
});

module.exports = router;