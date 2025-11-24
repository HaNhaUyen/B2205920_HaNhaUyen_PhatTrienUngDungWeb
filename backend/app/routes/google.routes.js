// routes/google.routes.js
const express = require("express");
const router = express.Router();
const googleController = require("../controllers/google.controller");

// POST /api/auth/google-login
router.post("/google-login", googleController.googleLogin);

module.exports = router;
