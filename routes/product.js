const express = require('express');
const productController = require('../controllers/product.controller');

const router = express.Router();

router.post('/', productController.insertProduct);
router.put('/:productId', productController.updateProduct);
router.delete('/:productId', productController.deleteProduct);
router.get('/', productController.getAllProducts);
router.get('/:productId', productController.getProductById);

module.exports = router;