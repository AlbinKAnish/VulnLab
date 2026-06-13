const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

const uploadDir = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },

    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage });

router.post("/upload", (req, res) => {
    upload.single("avatar")(req, res, (err) => {
        if (err) {
            return res.status(500).json({
                message: "Upload error",
                error: err.message
            });
        }

        if (!req.file) {
            return res.status(400).json({
                message: "No file uploaded"
            });
        }

        res.json({
            message: "File uploaded successfully",
            filename: req.file.originalname,
            path: `/api/upload/files/${req.file.originalname}`
        });
    });
});

router.get("/files/:filename", (req, res) => {
    const filePath = path.join(uploadDir, req.params.filename);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({
            message: "File not found"
        });
    }

    res.sendFile(filePath);
});

module.exports = router;