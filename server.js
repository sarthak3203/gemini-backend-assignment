require("dotenv").config();
const express = require("express");
const pool = require("./config/db.js");

const authRoutes = require("./routes/authRoutes.js");
const userRoutes = require("./routes/userRoutes.js");
const chatroomRoutes = require("./routes/chatroomRoutes.js");
const messageRoutes = require("./routes/messageRoutes.js");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
// const webhookRoutes = require("./routes/webhookRoutes");

const authMiddleware = require("./middlewares/authMiddleware.js");
const redis = require("./config/redis.js");
// const errorMiddleware = require("./middlewares/errorMiddleware");

const { startWorker } = require("./worker/geminiWorker.js"); // ✅ import worker

const PORT = process.env.PORT || 5000;
const app = express();

app.use(express.json());

pool.connect()
  .then(() => console.log("Connected to PostgreSQL"))
  .catch((err) => console.error("DB connection error:", err));

app.use("/auth", authRoutes);
app.use("/user", authMiddleware, userRoutes);
app.use("/chatroom", authMiddleware, chatroomRoutes);
app.use("/chatroom", authMiddleware, messageRoutes);
app.use("/", subscriptionRoutes);

//app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`🚀 Server started at http://localhost:${PORT}`);
  startWorker(); // ✅ start worker along with server
});
