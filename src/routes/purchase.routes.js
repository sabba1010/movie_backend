const express = require('express');
const { getAllPurchases, createPurchase } = require('../controllers/purchase.controller');

const router = express.Router();

router.get('/', getAllPurchases);
router.post('/', createPurchase);

module.exports = router;
