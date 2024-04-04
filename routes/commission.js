const express = require('express');
const commissionController = require('../controllers/commission.controller');

const router = express.Router();

router.post('/add', commissionController.addCommission);

module.exports = router;
