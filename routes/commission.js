const express = require('express');
const commissionController = require('../controllers/commission.controller');

const router = express.Router();

router.post('/add', commissionController.addOrUpdateCommission);
router.get('/', commissionController.getAllCommissions);
router.get('/emp/:empId', commissionController.getCommissionsByEmpId);
router.get('/report', commissionController.getCommissionReport);


module.exports = router; 

// GET /commission
// GET /commission?emp_id=1
// GET /commission?start_date=2024-01-01&end_date=2024-12-31
// GET /commission?month=05&year=2024
// GET /commission?year=2024
// GET /commission?emp_id=1&start_date=2024-01-01&end_date=2024-12-31
// GET /commission?emp_id=1&month=05&year=2024
// GET /commission?emp_id=1&year=2024
