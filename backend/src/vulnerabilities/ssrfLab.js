const express = require("express");
const axios = require("axios");

const router = express.Router();

// =====================
// Internal Admin Service
// =====================

router.get("/internal/admin", (req, res) => {
    res.json({
        message: "Internal service",
        apiKey: "vulnlab_admin_2026",
        note: "Do not expose externally"
    });
});

// =====================
// URL Fetcher Lab
// demo mode = safe
// vulnerable mode = real SSRF
// =====================

router.post("/fetch", async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({
            message: "URL required"
        });
    }

    const labMode = process.env.LAB_MODE || "demo";

    // =====================
    // DEMO MODE
    // =====================

    if (labMode === "demo") {
        const allowedUrls = [
            "https://example.com",
            "https://jsonplaceholder.typicode.com/todos/1"
        ];

        if (!allowedUrls.includes(url)) {
            return res.status(400).json({
                mode: "demo",
                message: "Only demo URLs are allowed",
                allowedUrls
            });
        }

        try {
            const response = await axios.get(url, {
                timeout: 5000,
                maxRedirects: 0
            });

            return res.json({
                mode: "demo",
                message: "Resource fetched safely",
                fetchedUrl: url,
                data: response.data
            });

        } catch (err) {
            return res.status(500).json({
                mode: "demo",
                message: "Unable to fetch demo resource",
                error: err.message
            });
        }
    }

    // =====================
    // VULNERABLE MODE
    // =====================

    try {
        const response = await axios.get(url);

        res.json({
            mode: "vulnerable",
            message: "Resource fetched",
            fetchedUrl: url,
            data: response.data
        });

    } catch (err) {
        res.status(500).json({
            mode: "vulnerable",
            message: "Unable to fetch resource",
            error: err.message
        });
    }
});

module.exports = router;