const express = require('express');
const salesController = require('../controllers/sales.controller');

const router = express.Router();

router.get('/report', salesController.getSalesReport);

module.exports = router;

// Example usage:
// GET /sales/report?start_date=2024-01-01&end_date=2024-12-31
// GET /sales/report?week=true
// GET /sales/report?day=true
// GET /sales/report?month=true
// GET /sales/report?year=true
