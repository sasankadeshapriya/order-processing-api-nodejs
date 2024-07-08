const express = require('express');
const trashController = require('../controllers/trash.controller');

const router = express.Router();

router.get('/deletedRecords/:model?', trashController.getDeletedRecords);
// Route for restoring deleted records
router.put('/restore/:model/:id', trashController.restoreDeletedRecord);

module.exports = router;