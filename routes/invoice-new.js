const express = require('express');
const invoiceController = require('../controllers/invoice-new.controller');

const router = express.Router();

router.post('/', invoiceController.createOrUpdateInvoice);

module.exports = router;