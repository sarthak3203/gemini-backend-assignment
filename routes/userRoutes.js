
const express = require("express");
const getUserProfile = require("../controllers/userController.js");

const router = express.Router();

// Protected route
router.get("/me", getUserProfile);

module.exports = router;
