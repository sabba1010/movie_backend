const express = require('express');
const { getAllResources, getResourceById, createResource, updateResource, deleteResource } = require('../controllers/resource.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', getAllResources);
router.get('/:id', getResourceById);

// Protected and admin only routes
router.post('/', protect, authorize('admin'), createResource);
router.put('/:id', protect, authorize('admin'), updateResource);
router.delete('/:id', protect, authorize('admin'), deleteResource);

module.exports = router;
