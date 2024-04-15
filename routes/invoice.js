const express = require('express');
const invoiceController = require('../controllers/invoice.controller');

const router = express.Router();

router.post('/', invoiceController.createInvoice);
router.put('/:invoiceId', invoiceController.updateInvoice);

module.exports = router;