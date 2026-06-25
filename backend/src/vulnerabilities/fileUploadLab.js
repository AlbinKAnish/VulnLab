const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const router = express.Router();

const uploadDir = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const labMode = process.env.LAB_MODE || "demo";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },

    filename: (req, file, cb) => {
        if (labMode === "demo") {
            const safeExt = path.extname(file.originalname).toLowerCase();
            const safeName = crypto.randomBytes(12).toString("hex") + safeExt;
            return cb(null, safeName);
        }

        cb(null, file.originalname);
    }
});

const demoFileFilter = (req, file, cb) => {
    if (labMode === "vulnerable") {
        return cb(null, true);
    }

    const allowedMimeTypes = [
        "image/png",
        "image/jpeg",
        "image/gif",
        "text/plain"
    ];

    const allowedExtensions = [
        ".png",
        ".jpg",
        ".jpeg",
        ".gif",
        ".txt"
    ];

    const ext = path.extname(file.originalname).toLowerCase();

    if (
        allowedMimeTypes.includes(file.mimetype) &&
        allowedExtensions.includes(ext)
    ) {
        return cb(null, true);
    }

    cb(new Error("Demo mode only allows PNG, JPG, GIF, and TXT files"));
};

const upload = multer({
    storage,
    fileFilter: demoFileFilter,
    limits: labMode === "demo"
        ? { fileSize: 1024 * 1024 }
        : {}
});

router.post("/upload", (req, res) => {
    upload.single("avatar")(req, res, (err) => {
        if (err) {
            return res.status(400).json({
                mode: labMode,
                message: "Upload blocked or failed",
                error: err.message
            });
        }

        if (!req.file) {
            return res.status(400).json({
                mode: labMode,
                message: "No file uploaded"
            });
        }

        res.json({
            mode: labMode,
            message: labMode === "demo"
                ? "File uploaded safely"
                : "File uploaded successfully",
            originalName: req.file.originalname,
            filename: req.file.filename,
            path: `/api/upload/files/${req.file.filename}`
        });
    });
});

router.get("/files/:filename", (req, res) => {
    const safeName = path.basename(req.params.filename);
    const filePath = path.join(uploadDir, safeName);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({
            message: "File not found"
        });
    }

    res.sendFile(filePath);
});

module.exports = router;