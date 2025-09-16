const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Worker } = require("bullmq");
const Redis = require("ioredis");
const messageModel = require("../models/messageModel.js");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function callGeminiAPI(userText) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(userText);
    return result.response.text();
  } catch (err) {
    console.error("Gemini API Error:", err);
    return "⚠️ Sorry, something went wrong with Gemini.";
  }
}

function startWorker() {
  const connection = new Redis(process.env.REDIS_URL, {
    tls: { rejectUnauthorized: false },
    maxRetriesPerRequest: null,
  });

  const worker = new Worker(
    "gemini-messages",
    async (job) => {
      const { chatroom_id, text } = job.data;

      const geminiReply = await callGeminiAPI(text);

      await messageModel.addGeminiMessage(chatroom_id, geminiReply);

      return { reply: geminiReply };
    },
    { connection }
  );

  worker.on("completed", (job) => {
    console.log(`✅ Job ${job.id} completed`);
  });

  worker.on("failed", (job, err) => {
    console.error(`❌ Job ${job?.id} failed:`, err.message);
  });
}

module.exports = { startWorker };
