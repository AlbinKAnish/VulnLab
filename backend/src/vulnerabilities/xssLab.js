const express = require("express");

const router = express.Router();

let comments = [];

// ADD COMMENT - intentionally vulnerable storage
router.post("/comment", (req, res) => {
    const { name, comment } = req.body;

    comments.push({
        id: comments.length + 1,
        name,
        comment
    });

    res.json({
        message: "Comment added successfully",
        comments
    });
});

// GET COMMENTS
router.get("/comments", (req, res) => {
    res.json({
        comments
    });
});

module.exports = router;