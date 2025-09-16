const express = require('express');
const router = express.Router();
const { createProSubscription, checkSubscriptionStatus } = require('../controllers/subscriptionController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/subscribe/pro', authMiddleware, createProSubscription);
router.get("/subscription/status", authMiddleware, checkSubscriptionStatus)

module.exports = router;
