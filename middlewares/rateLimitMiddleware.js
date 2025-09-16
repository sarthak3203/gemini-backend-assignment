const userModel = require("../models/userModel.js");
const { getUserResponseCount } = require("../utils/redisHelper.js");

async function rateLimitMiddleware(req, res, next) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const subscriptionStatus = await userModel.checkUserStatus(user.id);
    if (subscriptionStatus === "Basic") {
      const count = await getUserResponseCount(user.id);
      if (count >= 5) {
        return res.status(429).json({
          success: false,
          message: "Daily limit of 5 responses reached for BASIC users. Please try again tomorrow or upgrade your subscription."
        });
      }
    }
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = rateLimitMiddleware;
