const express = require('express');
const router = express.Router();
const filmSliderController = require('../controllers/filmSlider.controller');

router.get('/', filmSliderController.getSliders);
router.get('/admin', filmSliderController.getAllSlidersAdmin);
router.post('/', filmSliderController.createSlider);
router.put('/:id', filmSliderController.updateSlider);
router.delete('/:id', filmSliderController.deleteSlider);

module.exports = router;
