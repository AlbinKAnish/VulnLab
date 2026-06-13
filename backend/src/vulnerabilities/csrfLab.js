const express = require("express");

const router = express.Router();

// Demo employee profile state
let employeeProfile = {
    username: "alex",
    email: "alex@vulnlab.local",
    emergencyContact: "9876543210"
};

// View employee profile
router.get("/profile", (req, res) => {
    res.json({
        message: "Employee profile fetched",
        profile: employeeProfile
    });
});

// Vulnerable emergency contact update
// No CSRF token validation
router.post("/update-contact", (req, res) => {
    const { emergencyContact } = req.body;

    if (!emergencyContact) {
        return res.status(400).json({
            message: "Emergency contact is required"
        });
    }

    employeeProfile.emergencyContact = emergencyContact;

    res.json({
        message: "Emergency contact updated successfully",
        profile: employeeProfile
    });
});

module.exports = router;