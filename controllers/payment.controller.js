const models = require('../models');
const validator = require('fastest-validator');

async function addPayment(req, res) {
    try {
        const { reference_number, amount, payment_option, added_by_employee_id } = req.body;

        // Find the invoice to update
        const invoice = await models.Invoice.findOne({ where: { reference_number } });
        if (!invoice) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        // Update invoice attributes based on payment
        let paid_amount = invoice.paid_amount;
        let balance = invoice.balance;

        // Update paid amount and balance based on payment option
        if (payment_option !== 'cheque') {
            paid_amount += amount;
            balance -= amount;
        }

        // Create the payment record
        const payment = await models.Payment.create({
            reference_number,
            amount,
            payment_option,
            state: payment_option !== 'cheque' ? 'verified' : 'not-verified',
            added_by_employee_id,
            notes: req.body.notes
        });

        // Update invoice attributes
        await invoice.update({ paid_amount, balance });

        // Fetch updated invoice details
        const updatedInvoice = await models.Invoice.findOne({
            where: { reference_number },
            include: [models.InvoiceDetail]
        });

        res.status(200).json({ message: "Payment added successfully", invoice: updatedInvoice });
    } catch (error) {
        console.error("Error adding payment:", error);
        res.status(500).json({ message: "Failed to add payment" });
    }
}

module.exports = {
    addPayment:addPayment
}