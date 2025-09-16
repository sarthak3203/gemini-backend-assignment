const {postChatroom, getChatrooms,getChatroomById} = require("../controllers/chatroomController.js")
const express = require("express")

const router = express.Router();

router.post("/", postChatroom);
router.get("/", getChatrooms)
router.get("/:id", getChatroomById)

module.exports = router;