const models = require('../models');
const validator = require('fastest-validator');
const { Op } = require('sequelize');

const v = new validator();

const invoiceSchema = {
    reference_number: { type: "string" },
    client_id: { type: "number" },
    employee_id: { type: "number" },
    total_amount: { type: "number" },
    paid_amount: { type: "number" },
    balance: { type: "number" },
    discount: { type: "number" },
    payment_option: { type: "enum", values: ['credit', 'cash', 'cheque', 'cash-half'] },
    products: { type: "array", items: { type: "object", props: {
        product_id: { type: "number" },
        batch_id: { type: "number" },
        quantity: { type: "number" },
        sum: { type: "number" }
    }}}
};

async function createInvoice(req, res) {
    try {
        const validationResponse = v.validate(req.body, invoiceSchema);
        if (validationResponse !== true) {
            return res.status(400).json({ message: "Validation failed", errors: validationResponse });
        }

        // Check if the reference number already exists
        const existingInvoice = await models.Invoice.findOne({ where: { reference_number: req.body.reference_number } });
        if (existingInvoice) {
            return res.status(400).json({ message: "Invoice with the same reference number already exists" });
        }

        // Check if at least one product is provided
        if (!req.body.products || req.body.products.length === 0) {
            return res.status(400).json({ message: "At least one product must be provided" });
        }

        // Create the invoice
        const { products, ...invoiceData } = req.body;
        const newInvoice = await models.Invoice.create(invoiceData);

        // Create invoice details for each product
        const invoiceDetailsPromises = products.map(async (product) => {
            await models.InvoiceDetail.create({
                reference_number: newInvoice.reference_number,
                ...product
            });
        });
        await Promise.all(invoiceDetailsPromises);

        // If paid_amount is greater than 0 and payment_option is not 'credit', create a payment record
        let createdPayment = null;
        if (newInvoice.paid_amount > 0 && newInvoice.payment_option !== 'credit') {
            const paymentState = newInvoice.payment_option === 'cheque' ? 'not-verified' : 'verified';
            createdPayment = await models.Payment.create({
                reference_number: newInvoice.reference_number,
                amount: newInvoice.paid_amount,
                payment_option: newInvoice.payment_option,
                state: paymentState,
                added_by_employee_id: newInvoice.employee_id
            });
        }

        // Fetch the newly created invoice with associated products
        const invoiceWithProducts = await models.Invoice.findOne({
            where: { reference_number: newInvoice.reference_number },
            include: [models.InvoiceDetail]
        });

        // Prepare response message
        let message = "Invoice created successfully";
        let responseData = { invoice: invoiceWithProducts };
        if (createdPayment) {
            message += " and payment record created";
            responseData.payment = createdPayment;
        }

        res.status(201).json({ message, ...responseData });
    } catch (error) {
        console.error("Error creating invoice:", error);
        res.status(500).json({ message: "Failed to create invoice" });
    }
}

//update invoice
async function updateInvoice(req, res) {
    try {
        const invoiceId = req.params.invoiceId;
        const existingInvoice = await models.Invoice.findByPk(invoiceId, { include: [models.InvoiceDetail] });
        if (!existingInvoice) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        // Validate the request body
        const validationResponse = v.validate(req.body, invoiceSchema);
        if (validationResponse !== true) {
            return res.status(400).json({ message: "Validation failed", errors: validationResponse });
        }

        // Update the invoice attributes
        const { products, ...invoiceData } = req.body;
        
        // Check if at least one product is provided
        if (!products || products.length === 0) {
            return res.status(400).json({ message: "At least one product must be provided" });
        }

        await existingInvoice.update(invoiceData);

        // Handle payment record
        const paymentOption = invoiceData.payment_option;
        const paidAmount = invoiceData.paid_amount || 0;
        let paymentState = 'verified';
        let paymentRecordCreated = false;

        if (paymentOption && paymentOption === 'cheque') {
            paymentState = 'not-verified';
        }

        if (paymentOption && paymentOption !== 'credit' && paidAmount > 0) {
            // Create or update payment record only if paid amount is greater than 0
            let existingPayment = await models.Payment.findOne({ where: { reference_number: existingInvoice.reference_number } });
            if (existingPayment) {
                // Update existing payment record if paid amount is updated
                await existingPayment.update({
                    amount: paidAmount,
                    payment_option: paymentOption,
                    state: paymentState,
                    added_by_employee_id: existingInvoice.employee_id
                });
            } else {
                // Create new payment record
                await models.Payment.create({
                    reference_number: existingInvoice.reference_number,
                    amount: paidAmount,
                    payment_option: paymentOption,
                    state: paymentState,
                    added_by_employee_id: existingInvoice.employee_id
                });
                paymentRecordCreated = true;
            }
        } else if (paymentOption === 'credit' || paidAmount <= 0) {
            // Delete existing payment record if payment option is updated to 'credit' or paid amount is <= 0
            await models.Payment.destroy({ where: { reference_number: existingInvoice.reference_number } });
        }

        // Update existing products in the invoice details
        const updatedProductsPromises = existingInvoice.InvoiceDetails.map(async (existingProduct) => {
            const updatedProduct = products.find(product =>
                product.product_id === existingProduct.product_id && product.batch_id === existingProduct.batch_id
            );
            if (updatedProduct) {
                await existingProduct.update({
                    quantity: updatedProduct.quantity,
                    sum: updatedProduct.sum
                });
            } else {
                // Remove the product if not found in the updated products list
                await existingProduct.destroy();
            }
        });
        await Promise.all(updatedProductsPromises);

        // Add new products to the invoice details
        const newProducts = products.filter(product =>
            !existingInvoice.InvoiceDetails.some(existingProduct =>
                existingProduct.product_id === product.product_id && existingProduct.batch_id === product.batch_id
            )
        );
        const newProductsPromises = newProducts.map(async (product) => {
            await models.InvoiceDetail.create({
                reference_number: existingInvoice.reference_number,
                ...product
            });
        });
        await Promise.all(newProductsPromises);

        // Fetch the updated invoice with associated products
        const updatedInvoice = await models.Invoice.findByPk(invoiceId, { include: [models.InvoiceDetail] });

        let message = "Invoice updated successfully";
        if (paymentRecordCreated) {
            message += ", payment record created";
        }

        // Fetch payment details if a payment record exists
        const paymentDetails = await models.Payment.findOne({ where: { reference_number: existingInvoice.reference_number } });

        res.status(200).json({ message, invoice: updatedInvoice, payment: paymentDetails });
    } catch (error) {
        console.error("Error updating invoice:", error);
        res.status(500).json({ message: "Failed to update invoice" });
    }
}


async function deleteInvoice(req, res) {
    try {
        const invoiceId = req.params.invoiceId;
        
        // Find the invoice by ID
        const invoice = await models.Invoice.findByPk(invoiceId);
        
        if (!invoice) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        // Delete associated invoice details using reference_number
        await models.InvoiceDetail.destroy({ where: { reference_number: invoice.reference_number } });

        // Delete associated payments using reference_number
        await models.Payment.destroy({ where: { reference_number: invoice.reference_number } });

        // Delete the invoice itself
        await invoice.destroy();

        res.status(200).json({ message: "Invoice deleted successfully" });
    } catch (error) {
        console.error("Error deleting invoice:", error);
        res.status(500).json({ message: "Failed to delete invoice" });
    }
}

// Function to get a single invoice by ID
async function getInvoiceById(req, res) {
    try {
        const invoiceId = req.params.invoiceId;
        const invoice = await models.Invoice.findByPk(invoiceId, { include: [models.InvoiceDetail, models.Payment] });

        if (!invoice) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        res.status(200).json({ invoice });
    } catch (error) {
        console.error("Error fetching invoice:", error);
        res.status(500).json({ message: "Failed to fetch invoice" });
    }
}

// Function to get all invoices
async function getAllInvoices(req, res) {
    try {
        const invoices = await models.Invoice.findAll({ include: [models.InvoiceDetail, models.Payment] });

        res.status(200).json({ invoices });
    } catch (error) {
        console.error("Error fetching invoices:", error);
        res.status(500).json({ message: "Failed to fetch invoices" });
    }
}



module.exports = {
    createInvoice:createInvoice,
    updateInvoice:updateInvoice,
    deleteInvoice:deleteInvoice,
    getInvoiceById:getInvoiceById,
    getAllInvoices:getAllInvoices
}
