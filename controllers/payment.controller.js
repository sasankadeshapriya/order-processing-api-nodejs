const models = require('../models');
const validator = require('fastest-validator');


async function addPayment(req, res) {
    try {
        // Check if all required fields are present in the request body
        const { reference_number, amount, payment_option, added_by_employee_id } = req.body;
        if (!reference_number || !amount || !payment_option || !added_by_employee_id) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Check if the payment amount is valid
        if (isNaN(amount) || amount <= 0) {
            return res.status(400).json({ message: "Invalid payment amount" });
        }

        // Check if the payment option is valid
        if (!['credit', 'cash', 'cheque', 'cash-half'].includes(payment_option)) {
            return res.status(400).json({ message: "Invalid payment option" });
        }

        // Find the invoice to update
        const invoice = await models.Invoice.findOne({ where: { reference_number } });
        if (!invoice) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        // Calculate the updated paid_amount
        let paid_amount = parseFloat(invoice.paid_amount) + parseFloat(amount);

        // Update balance based on payment option
        let balance = parseFloat(invoice.total_amount) - paid_amount;

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

async function updatePayment(req, res) {
    try {
        const paymentId = req.params.paymentId;
        const { amount, payment_option } = req.body;

        // Check if either amount or payment_option is provided
        if (!amount && !payment_option) {
            return res.status(400).json({ message: "Either 'amount' or 'payment_option' must be provided" });
        }

        // Check if the payment amount is valid
        if (amount !== undefined && (isNaN(amount) || amount <= 0)) {
            return res.status(400).json({ message: "Invalid payment amount" });
        }

        // Check if the payment option is valid
        if (payment_option && !['credit', 'cash', 'cheque', 'cash-half'].includes(payment_option)) {
            return res.status(400).json({ message: "Invalid payment option" });
        }

        // Find the payment to update
        const payment = await models.Payment.findByPk(paymentId);
        if (!payment) {
            return res.status(404).json({ message: "Payment not found" });
        }

        // Calculate the difference in amount if provided
        let diffAmount = 0;
        if (amount !== undefined) {
            diffAmount = amount - payment.amount;
        }

        // Update the payment amount and payment option if provided
        if (amount !== undefined) {
            await payment.update({ amount });
        }
        if (payment_option) {
            await payment.update({ payment_option });
        }

        // Update the invoice's paid amount and balance
        const invoice = await models.Invoice.findOne({ where: { reference_number: payment.reference_number } });
        if (!invoice) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        let paid_amount = parseFloat(invoice.paid_amount);
        let balance = parseFloat(invoice.total_amount) - paid_amount;

        if (amount !== undefined) {
            paid_amount += parseFloat(diffAmount);
            balance -= parseFloat(diffAmount);
        }

        await invoice.update({ paid_amount, balance });

        const updatedPayment = await models.Payment.findByPk(paymentId);

        res.status(200).json({ message: "Payment updated successfully", payment: updatedPayment });
    } catch (error) {
        console.error("Error updating payment:", error);
        res.status(500).json({ message: "Failed to update payment" });
    }
}

module.exports = {
    addPayment:addPayment,
    updatePayment:updatePayment
}