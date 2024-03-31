const express = require('express');
const batchController = require('../controllers/batch.controller');

const router = express.Router();

router.post('/', batchController.insertBatch);
router.put('/:batchId', batchController.updateBatch);
router.delete('/:batchId', batchController.deleteBatch);
router.get('/', batchController.getAllBatches);
router.get('/:batchId', batchController.getBatchById);

module.exports = router;
