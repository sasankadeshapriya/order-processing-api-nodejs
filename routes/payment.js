const express = require('express');
const paymentController = require('../controllers/payment.controller');

const router = express.Router();

router.post('/', paymentController.addPayment);
router.put('/:paymentId', paymentController.updatePayment);
router.delete('/:paymentId', paymentController.deletePayment);
router.get('/', paymentController.getAllPayments);
router.get('/:paymentId', paymentController.getPaymentById);
router.put('/:paymentId/state', paymentController.updatePaymentState);

module.exports = router;

// http://localhost:4000/payment?employee_id=5
// http://localhost:4000/payment?client_id=1
// ?state=verified
// ?reference_number=INV123
// ?payment_option=cash
// ?payment_option=cash&reference_number=INV123 ---> use multiple filters