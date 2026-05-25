const express = require('express');
const { getSettings, updateSetting } = require('../controllers/setting.controller');

const router = express.Router();

router.get('/', getSettings);
router.post('/', updateSetting);

module.exports = router;
