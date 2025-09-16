const Redis = require('ioredis');

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Create Redis client that auto-connects on instantiation
const redisClient = new Redis(redisUrl);

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

// No need to call redisClient.connect() here

function getMidnightTimestamp() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setDate(now.getDate() + 1);
  midnight.setHours(0, 0, 0, 0);
  return Math.floor(midnight.getTime() / 1000);
}

async function getUserResponseCount(userId) {
  const today = new Date().toISOString().split('T')[0];
  const key = `usage:${userId}:${today}`;
  const count = await redisClient.get(key);
  return count ? parseInt(count, 10) : 0;
}

async function incrementUserResponseCount(userId) {
  const today = new Date().toISOString().split('T')[0];
  const key = `usage:${userId}:${today}`;

  let count = await redisClient.get(key);
  if (count === null) {
    await redisClient.set(key, 1);
    await redisClient.expireat(key, getMidnightTimestamp());
    count = 1;
  } else {
    count = await redisClient.incr(key);
  }
  return parseInt(count, 10);
}

module.exports = {
  getUserResponseCount,
  incrementUserResponseCount,
};
