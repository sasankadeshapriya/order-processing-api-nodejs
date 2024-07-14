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

async function deletePayment(req, res) {
    try {
        const paymentId = req.params.paymentId;

        // Find the payment to delete
        const payment = await models.Payment.findByPk(paymentId);
        if (!payment) {
            return res.status(404).json({ message: "Payment not found" });
        }

        // Find the associated invoice
        const invoice = await models.Invoice.findOne({ where: { reference_number: payment.reference_number } });
        if (!invoice) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        // Update invoice's paid amount and balance
        const newPaidAmount = parseFloat(invoice.paid_amount) - parseFloat(payment.amount);
        const newBalance = parseFloat(invoice.total_amount) - newPaidAmount;
        await invoice.update({ paid_amount: newPaidAmount, balance: newBalance });

        // Delete the payment record with softdelete
        await payment.destroy();

        res.status(200).json({ message: "Payment deleted successfully" });
    } catch (error) {
        console.error("Error deleting payment:", error);
        res.status(500).json({ message: "Failed to delete payment" });
    }
}

async function getAllPayments(req, res) {
    try {
        // Extract query parameters
        const { payment_option, reference_number, state, client_id, employee_id } = req.query;

        // Build filter object based on provided query parameters
        const filter = {};
        if (payment_option) filter.payment_option = payment_option;
        if (reference_number) filter.reference_number = reference_number;
        if (state) filter.state = state;

        // If client_id is provided, find invoices with matching client_id
        if (client_id) {
            const invoices = await models.Invoice.findAll({ where: { client_id } });
            const invoiceReferenceNumbers = invoices.map(invoice => invoice.reference_number);
            filter.reference_number = invoiceReferenceNumbers;
        }

        // If employee_id is provided, filter payments by employee_id
        if (employee_id) filter.added_by_employee_id = employee_id;

        // Find payments based on the filter
        const payments = await models.Payment.findAll({ where: filter });

        res.status(200).json({ payments });
    } catch (error) {
        console.error("Error fetching payments:", error);
        res.status(500).json({ message: "Failed to fetch payments" });
    }
}

//get payment by id
async function getPaymentById(req, res) {
    try {
        const paymentId = req.params.paymentId;

        // Find the payment by ID
        const payment = await models.Payment.findByPk(paymentId);
        if (!payment) {
            return res.status(404).json({ message: "Payment not found" });
        }

        res.status(200).json({ payment });
    } catch (error) {
        console.error("Error getting payment by ID:", error);
        res.status(500).json({ message: "Failed to get payment" });
    }
}

async function updatePaymentState(req, res) {
    try {
        const paymentId = req.params.paymentId;
        const { state } = req.body;

        // Check if the state is valid
        if (!['verified', 'not-verified'].includes(state)) {
            return res.status(400).json({ message: "Invalid state" });
        }

        // Find the payment to update
        const payment = await models.Payment.findByPk(paymentId);
        if (!payment) {
            return res.status(404).json({ message: "Payment not found" });
        }

        // Update the payment state
        await payment.update({ state });

        res.status(200).json({ message: "Payment state updated successfully", payment });
    } catch (error) {
        console.error("Error updating payment state:", error);
        res.status(500).json({ message: "Failed to update payment state", error: error.message });
    }
}




module.exports = {
    addPayment:addPayment,
    updatePayment:updatePayment,
    deletePayment:deletePayment,
    getAllPayments:getAllPayments,
    getPaymentById: getPaymentById,
    updatePaymentState: updatePaymentState
}