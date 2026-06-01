const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
// const { protect, authorize } = require('../middlewares/auth');

router.route('/')
    .get(productController.getProducts)
    .post(productController.createProduct); // protect, authorize('admin') ideally

router.route('/:id')
    .put(productController.updateProduct)
    .delete(productController.deleteProduct);

module.exports = router;
