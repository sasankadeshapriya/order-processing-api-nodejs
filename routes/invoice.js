const express = require('express');
const invoiceController = require('../controllers/invoice.controller');

const router = express.Router();

router.post('/', invoiceController.createInvoice);
router.put('/:invoiceId', invoiceController.updateInvoice);
router.delete('/:invoiceId', invoiceController.deleteInvoice);
router.get('/:invoiceId', invoiceController.getInvoiceById);
router.get('/', invoiceController.getAllInvoices);

module.exports = router;