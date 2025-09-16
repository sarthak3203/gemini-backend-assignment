const express = require("express");
const { signup, sendOtp, verifyOtp, sendForgotPasswordOtp,changePassword } = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/signup", signup);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/forgot-password", sendForgotPasswordOtp)
router.post("/change-password", authMiddleware, changePassword)


module.exports = router;
