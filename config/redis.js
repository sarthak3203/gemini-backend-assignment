require("dotenv").config();

const Redis = require("ioredis");

// Connect using the URL from .env
const redis = new Redis(process.env.REDIS_URL);

// Event listeners to know status
redis.on("connect", () => {
  console.log("✅ Connected to Redis");
});

redis.on("error", (err) => {
  console.error("❌ Redis error:", err);
});

module.exports = redis;
