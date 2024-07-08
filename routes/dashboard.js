const express = require('express');
const dashController = require('../controllers/dashboard.controller');

const router = express.Router();

router.get('/summary', dashController.getSummaryData);

module.exports = router; 