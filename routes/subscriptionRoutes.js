const express = require('express');
const router = express.Router();
const { createProSubscription, handleWebhookStripe, checkSubscriptionStatus } = require('../controllers/subscriptionController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/subscribe/pro', authMiddleware, createProSubscription);
router.post('/webhook/stripe', express.raw({ type: 'application/json' }), handleWebhookStripe);
router.get("/subscription/status", authMiddleware, checkSubscriptionStatus)

module.exports = router;
