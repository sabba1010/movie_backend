const express = require('express');
const router = express.Router();
const podcastController = require('../controllers/podcast.controller');
const { protect } = require('../middlewares/auth.middleware');

// Public routes
router.get('/seasons', podcastController.getAllSeasons);
router.get('/seasons/:id', podcastController.getSeasonById);
router.post('/episodes/:id/listen', podcastController.recordListen);
router.post('/seasons/:id/resources/download', podcastController.downloadResource);

// Protected Admin routes
router.post('/seasons', protect, podcastController.createSeason);
router.put('/seasons/:id', protect, podcastController.updateSeason);
router.delete('/seasons/:id', protect, podcastController.deleteSeason);

router.post('/episodes', protect, podcastController.createEpisode);
router.put('/episodes/:id', protect, podcastController.updateEpisode);
router.delete('/episodes/:id', protect, podcastController.deleteEpisode);

module.exports = router;
