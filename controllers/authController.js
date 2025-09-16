const userModel = require("../models/userModel.js");
const { generateOtp } = require("../utils/otp.js");
const otpModel = require("../models/otpModel.js");
const { findUserByMobile, updatePassword } = require("../models/userModel.js");
const { createTokenForTheUser } = require("../utils/jwt.js");
const bcrypt = require("bcryptjs");

async function signup(req, res) {
  try {
    const { mobile, name } = req.body;

    if (!mobile) {
      return res
        .status(400)
        .json({ success: false, error: "Mobile is required" });
    }

    const existingUser = await userModel.findUserByMobile(mobile);
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, error: "User already exists" });
    }

    const newUser = await userModel.createUser({ mobile, name });
    return res.json({
      success: true,
      message: "user created successfully",
      user: newUser,
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
}

async function sendOtp(req, res) {
  try {
    const { mobile } = req.body;

    if (!mobile) {
      return res.status(400).json({ error: "Mobile number is required" });
    }

    const user = await findUserByMobile(mobile);
    if (!user) {
      return res
        .status(404)
        .json({ error: "User/Mobile not found. Please sign up first." });
    }

    const otpCode = generateOtp();
    const expiresAt = new Date(Date.now() + 3 * 60 * 1000);

    await otpModel.createOtp(mobile, otpCode, "LOGIN", expiresAt);

    return res.status(200).json({
      message: "OTP generated successfully",
      otp: otpCode,
    });
  } catch (err) {
    console.error("Send OTP error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

async function verifyOtp(req, res) {
  try {
    const { mobile, otp } = req.body;

    if (!mobile || !otp) {
      return res
        .status(400)
        .json({ success: false, error: "Mobile and OTP are required" });
    }

    const otpRecord = await otpModel.findLatestOtpByMobile(mobile);

    if (!otpRecord) {
      return res
        .status(400)
        .json({ success: false, error: "No OTP found. Please request again." });
    }

    if (new Date(otpRecord.expires_at) < new Date()) {
      return res.status(400).json({ success: false, error: "OTP has expired" });
    }

    if (otpRecord.is_used) {
      return res
        .status(400)
        .json({ success: false, error: "OTP already used" });
    }

    if (otpRecord.otp_code !== otp) {
      return res.status(400).json({ success: false, error: "Invalid OTP" });
    }

    await otpModel.markOtpAsUsed(otpRecord.id);

    const user = await userModel.findUserByMobile(mobile);

    const token = createTokenForTheUser(user);

    return res.json({
      success: true,
      message: "OTP verified successfully",
      token,
    });
  } catch (err) {
    console.error("Verify OTP error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
}

async function sendForgotPasswordOtp(req, res) {
  try {
    const { mobile } = req.body;

    if (!mobile) {
      return res.status(400).json({ error: "Mobile number is required" });
    }

    const user = await findUserByMobile(mobile);
    if (!user) {
      return res
        .status(404)
        .json({ error: "User/Mobile not found. Please sign up first." });
    }

    const otpCode = generateOtp();
    const expiresAt = new Date(Date.now() + 3 * 60 * 1000);

    await otpModel.createOtp(mobile, otpCode, "PASSWORD_RESET", expiresAt);

    return res.status(200).json({
      message: "OTP generated successfully for password reset",
      otp: otpCode,
    });
  } catch (err) {
    console.error("Send OTP error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

async function changePassword(req, res) {
  try {
    console.log("req.user: ", req.user)
    const mobile = req.user?.mobile;
    if (!mobile) {
      return res
        .status(400)
        .json({ success: false, error: "User mobile not found" });
    }
    const { password } = req.body;
    if (!password) {
      return res
        .status(400)
        .json({ success: false, error: "New password is required" });
    }

    const saltRounds = 8;
    const password_hash = await bcrypt.hash(password, saltRounds);
    console.log("Hash:", password_hash);

    await updatePassword(mobile, password_hash);

    res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
}

// TO IMPLEMENT PASSWORD MATCHING OR LOGIN USING PASSWORD AND MOBILE IN FUTURE, WE CAN USE THIS METHOD

{
  /* const bcrypt = require("bcryptjs");

async function verifyPassword(passwordRecievedFromUser, hashedPassword) {
  try {
    const isMatch = await bcrypt.compare(passwordRecievedFromUser, hashedPassword);
    return isMatch; 
  } catch (error) {
    console.error("Error verifying password:", error);
    throw error; 
  }
}

module.exports = verifyPassword;
*/
}

module.exports = {
  signup,
  sendOtp,
  verifyOtp,
  sendForgotPasswordOtp,
  changePassword,
};
