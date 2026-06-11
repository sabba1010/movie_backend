const express = require('express');
const { createCheckoutSession, verifyCheckoutSession } = require('../controllers/payment.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/create-checkout-session', protect, createCheckoutSession);
router.get('/verify-session', verifyCheckoutSession);

module.exports = router;
