const express = require('express');
const router = express.Router();
const campaignController = require('../controllers/campaign.controller');

// Public routes
router.get('/', campaignController.getCampaigns);

// Protected Admin routes (add auth middleware if you have it)
router.post('/', campaignController.createCampaign);
router.put('/:id', campaignController.updateCampaign);
router.delete('/:id', campaignController.deleteCampaign);

module.exports = router;
