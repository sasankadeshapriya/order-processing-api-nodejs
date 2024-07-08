const express = require('express');
const trashController = require('../controllers/trash.controller');

const router = express.Router();

router.get('/deletedRecords/:model?', trashController.getDeletedRecords);


module.exports = router;