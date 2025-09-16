const messageModel = require("../models/messageModel.js");
const { messageQueue, connection } = require("../config/bullMQ.js");
const { QueueEvents } = require("bullmq");
const { incrementUserResponseCount } = require("../utils/redisHelper.js");

async function postMessage(req, res) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { id: chatroom_id } = req.params;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ success: false, message: "Message text required" });
    }

    await messageModel.addUserMessage(chatroom_id, text);

    await incrementUserResponseCount(user.id);

    const job = await messageQueue.add("process-message", { chatroom_id, text });

    const queueEvents = new QueueEvents("gemini-messages", { connection });
    await queueEvents.waitUntilReady();

    try {
      const result = await job.waitUntilFinished(queueEvents, 20000); // 20s timeout
      return res.status(200).json({
        success: true,
        message: text,
        gemini_reply: result.reply,
      });
    } catch (err) {
      return res.status(202).json({
        success: true,
        message: text,
        status: "processing",
        info: "Gemini response will be available soon. Fetch messages later.",
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = { postMessage };
