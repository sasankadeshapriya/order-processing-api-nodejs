const models = require('../models');
const validator = require('fastest-validator');

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

// Create an invoice along with invoice details
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

        // Fetch the newly created invoice with associated products
        const invoiceWithProducts = await models.Invoice.findOne({
            where: { reference_number: newInvoice.reference_number },
            include: [models.InvoiceDetail]
        });

        res.status(201).json({ message: "Invoice created successfully", invoice: invoiceWithProducts });
    } catch (error) {
        console.error("Error creating invoice:", error);
        res.status(500).json({ message: "Failed to create invoice" });
    }
}

module.exports = {
    createInvoice:createInvoice
}
