const express = require('express');
const invoiceController = require('../controllers/invoice.controller');

const router = express.Router();

router.post('/', invoiceController.createInvoice);

module.exports = router;