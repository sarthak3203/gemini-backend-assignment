require("dotenv").config();

const { Queue } = require("bullmq");
const Redis = require("ioredis");

const connection = new Redis(process.env.REDIS_URL, {
  tls: { rejectUnauthorized: false },
  maxRetriesPerRequest: null  
});

const messageQueue = new Queue("gemini-messages", { connection });

module.exports = {messageQueue, connection};
