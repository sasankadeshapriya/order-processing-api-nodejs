const express = require('express');
const dayEndController = require('../controllers/day-end-report.controller');

const router = express.Router();

router.get('/', dayEndController.getDayEndReport);

module.exports = router;
