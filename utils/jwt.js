const jwt = require("jsonwebtoken");
const secret = process.env.JWT_SECRET;

function createTokenForTheUser(user) {
  const payload = {
    id: user.id,
    name: user.name,
    mobile: user.mobile,
    subscription: user.subscription,
  };
  const token = jwt.sign(payload, secret, { expiresIn: "1d" });
  return token;

}

function validateToken(token) {
  try {

    const payload = jwt.verify(token, secret);
    return payload;
  } catch (err) {
    console.error("JWT validation error:", err.message);
    throw new Error("Invalid or expired token");
  }
}

module.exports = { createTokenForTheUser, validateToken };
