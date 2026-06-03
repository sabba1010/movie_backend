const express = require('express');
const router = express.Router();
const kidsController = require('../controllers/kidsController');

// Series
router.get('/series', kidsController.getAllSeries);
router.post('/series', kidsController.createSeries);
router.get('/series/:id', kidsController.getSeriesById);
router.put('/series/:id', kidsController.updateSeries);
router.delete('/series/:id', kidsController.deleteSeries);

// Episodes
router.get('/series/:seriesId/episodes', kidsController.getEpisodesBySeries);
router.post('/series/:seriesId/episodes', kidsController.createEpisode);
router.put('/episodes/:episodeId', kidsController.updateEpisode);
router.delete('/episodes/:episodeId', kidsController.deleteEpisode);

// Settings
router.get('/settings', kidsController.getKidsSettings);
router.post('/settings', kidsController.updateKidsSettings);

module.exports = router;
