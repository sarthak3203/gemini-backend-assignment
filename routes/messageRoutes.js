const express = require("express");
const { postMessage } = require("../controllers/messageController");
const rateLimitMiddleware = require("../middlewares/rateLimitMiddleware");


const router = express.Router();


router.post("/:id/message", rateLimitMiddleware ,postMessage);

module.exports = router;