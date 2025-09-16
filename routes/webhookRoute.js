const express = require("express");
const handleWebhookStripe = require("../controllers/webhookController");


const router = express.Router();

router.post("/",handleWebhookStripe)

module.exports = router;