const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Intentionally weak secret for the lab
const WEAK_JWT_SECRET = "vulnlab";

// Demo employee login
router.post("/employee-login", (req, res) => {
    const { username, password } = req.body;

    if (username !== "alex" || password !== "alex123") {
        return res.status(401).json({
            message: "Invalid employee credentials"
        });
    }

    const token = jwt.sign(
        {
            username: "alex",
            department: "support",
            employeeLevel: "L1"
        },
        WEAK_JWT_SECRET,
        {
            expiresIn: "1h"
        }
    );

    res.json({
        message: "Employee login successful",
        token,
        employee: {
            username: "alex",
            department: "support",
            employeeLevel: "L1"
        }
    });
});

// Locked payroll portal
router.get("/payroll", (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "No token provided"
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, WEAK_JWT_SECRET);

        if (
            decoded.department !== "hr" &&
            decoded.employeeLevel !== "L3"
        ) {
            return res.status(403).json({
                message: "Access denied. Payroll portal is restricted to HR staff or L3 employees.",
                currentAccess: {
                    department: decoded.department,
                    employeeLevel: decoded.employeeLevel
                }
            });
        }

        res.json({
            message: "Payroll access granted",

            payrollData: {
                employee: decoded.username,
                salary: "$115,000",
                department: "HR",
                internalApiKey: "HR-API-2026-9XJ2",
                note: "Use this key to access internal payroll systems."
            }
        });

    } catch (err) {
        return res.status(403).json({
            message: "Invalid or expired token"
        });
    }
});

module.exports = router;