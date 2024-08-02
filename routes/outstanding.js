const express = require('express');
const outstandingController = require('../controllers/outstanding.controller');
const checkAuthMiddleware = require('../middleware/authentication');

const router = express.Router();

router.get('/', outstandingController.getClientsWithOutstandingBalances);

module.exports = router;

// ?filter=custom&start_date=2023-01-01&end_date=2023-01-31
// ?filter=week
// ?filter=month
// ?filter=day
// ?filter=year