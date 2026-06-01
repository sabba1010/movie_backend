const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donation.controller');
// const { protect, authorize } = require('../middlewares/auth');

router.post('/', donationController.createDonation);
router.get('/', donationController.getDonations); // Typically protect this

module.exports = router;
