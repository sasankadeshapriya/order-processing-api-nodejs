const models = require('../models');
const { Invoice, InvoiceDetail, Payment, Commission, Employee } = require('../models');
const validator = require('fastest-validator');
const { Op } = require('sequelize');
const moment = require('moment');


const v = new validator();

const invoiceSchema = {
    reference_number: { type: "string", min: 3, max: 255 },
    client_id: { type: "number", integer: true },
    employee_id: { type: "number", integer: true },
    total_amount: { type: "number", positive: true },
    paid_amount: { type: "number", nonnegative: true },
    balance: { type: "number", nonnegative: true },
    discount: { type: "number", nonnegative: true },
    payment_option: { type: "enum", values: ['credit', 'cash', 'cheque', 'cash-half'] },
    bank: { type: "string", optional: true },
    cheque_number: { type: "string", optional: true },
    products: {
        type: "array", min: 1, items: {
            type: "object", props: {
                product_id: { type: "number", integer: true },
                batch_id: { type: "string", min: 1 },
                quantity: { type: "number", positive: true },
                sum: { type: "number", positive: true }
            }
        }
    },
    auto: { type: "boolean" },
    amount_allocated: { type: "number", optional: true, nonnegative: true }
};

async function createOrUpdateInvoice(req, res) {
    const t = await models.sequelize.transaction();
    try {
        const validationResponse = v.validate(req.body, invoiceSchema);
        if (validationResponse !== true) {
            console.log('Validation failed:', validationResponse);
            await t.rollback();
            return res.status(400).json({ message: "Validation failed", errors: validationResponse });
        }

        const {
            reference_number, client_id, employee_id, total_amount, paid_amount, discount,
            credit_period_end_date, payment_option, bank, cheque_number, cheque_date,
            products, auto, amount_allocated
        } = req.body;

        const employee = await models.Employee.findByPk(employee_id);
        if (!employee) {
            await t.rollback();
            return res.status(404).json({ message: "Employee not found" });
        }

        const existingInvoice = await models.Invoice.findOne({ where: { reference_number }, transaction: t });
        if (existingInvoice) {
            await t.rollback();
            return res.status(409).json({ message: "An invoice with the same reference number already exists." });
        }
                
        if (auto && amount_allocated) {
            const totalOutstanding = await getTotalOutstandingAmount(client_id, t);
            if (amount_allocated > totalOutstanding) {
                await t.rollback();
                return res.status(400).json({ message: "Error: Allocated amount exceeds the total outstanding balance. Please try again." });
            }
            await settleOldInvoices(client_id, amount_allocated, employee_id, payment_option, bank, cheque_number, cheque_date, t);
        }

        const newInvoiceData = {
            reference_number,
            client_id,
            employee_id,
            total_amount,
            paid_amount: auto ? 0 : paid_amount,
            balance: total_amount - (auto ? 0 : paid_amount),
            discount,
            credit_period_end_date,
            payment_option
        };
        const newInvoice = await models.Invoice.create(newInvoiceData, { transaction: t });

        await Promise.all(products.map(product =>
            models.InvoiceDetail.create({
                reference_number: newInvoice.reference_number,
                product_id: product.product_id,
                batch_id: product.batch_id,
                quantity: product.quantity,
                sum: product.sum
            }, { transaction: t })
        ));

        // Calculate commission and update
        const commissionRate = employee.commission_rate;
        const commissionValue = total_amount * (commissionRate / 100);
        const commissionDate = moment().startOf('day').format('YYYY-MM-DD HH:mm:ss');
        await addOrUpdateCommission({
            emp_id: employee_id,
            date: commissionDate,
            commission: commissionValue,
            t
        });
        
        if (!auto && paid_amount > 0) {
            await createPaymentRecord({
                reference_number, amount: paid_amount, payment_option, employee_id, bank, cheque_number, cheque_date, t
            });
        }

        await t.commit();
        res.status(201).json({ message: "Invoice processed successfully", invoice: newInvoice });
    } catch (error) {
        console.log('Error encountered, rolling back:', error);
        await t.rollback();
        res.status(500).json({ message: "Failed to process invoice", error: error.message });
    }
}

async function addOrUpdateCommission({ emp_id, date, commission, t }) {
    // Truncate time to ensure comparisons are done on date only
    const transactionDate = moment(date).startOf('day').format('YYYY-MM-DD HH:mm:ss');

    console.log(`Looking for commission with emp_id: ${emp_id}, date: ${transactionDate}`);

    const existingCommission = await models.Commission.findOne({
        where: {
            emp_id: emp_id,
            date: {
                [Op.between]: [
                    moment(transactionDate).startOf('day').toDate(),
                    moment(transactionDate).endOf('day').toDate()
                ]
            }
        },
        transaction: t
    });

    if (existingCommission) {
        console.log(`Existing commission found for date ${transactionDate}. Current commission: ${existingCommission.commission}, Additional: ${commission}`);

        // Ensure the update is calculated correctly
        existingCommission.commission = parseFloat(existingCommission.commission) + parseFloat(commission);
        await existingCommission.save({ transaction: t });

        console.log(`Commission updated to ${existingCommission.commission}`);

        return existingCommission;
    } else {
        console.log(`No existing commission found for emp_id: ${emp_id} on date: ${transactionDate}. Creating new record.`);

        const newCommission = await models.Commission.create({
            emp_id,
            date: transactionDate,
            commission: parseFloat(commission)
        }, { transaction: t });

        return newCommission;
    }
}



async function getTotalOutstandingAmount(clientId, transaction) {
    const invoices = await models.Invoice.findAll({
        where: { client_id: clientId, balance: { [Op.gt]: 0 } },
        attributes: ['balance'],
        transaction
    });
    return invoices.reduce((sum, invoice) => sum + parseFloat(invoice.balance), 0);
}

async function createPaymentRecord({ reference_number, amount, payment_option, employee_id, bank, cheque_number, cheque_date, t }) {
    let paymentData = {
        reference_number,
        amount,
        payment_option,
        state: payment_option === 'cheque' ? 'not-verified' : 'verified',
        added_by_employee_id: employee_id
    };
    if (payment_option === 'cheque') {
        paymentData = { ...paymentData, bank, cheque_number, cheque_date };
    }
    await models.Payment.create(paymentData, { t });
}

async function settleOldInvoices(clientId, allocatedAmount, employeeId, paymentOption, bank, chequeNumber, chequeDate, transaction) {
    const unpaidInvoices = await models.Invoice.findAll({
        where: { client_id: clientId, balance: { [Op.gt]: 0 } },
        order: [['createdAt', 'ASC']],
        transaction
    });

    for (let invoice of unpaidInvoices) {
        if (allocatedAmount <= 0) break;

        const amountToApply = Math.min(invoice.balance, allocatedAmount);
        allocatedAmount -= amountToApply;

        await models.Invoice.update({
            paid_amount: models.sequelize.literal(`paid_amount + ${amountToApply}`),
            balance: models.sequelize.literal(`balance - ${amountToApply}`)
        }, {
            where: { id: invoice.id },
            transaction
        });

        await createPaymentRecord({
            reference_number: invoice.reference_number,
            amount: amountToApply,
            payment_option: paymentOption,
            employee_id: employeeId, 
            bank,
            cheque_number: chequeNumber,
            cheque_date: chequeDate,
            t: transaction
        });
    }
}


module.exports = { createOrUpdateInvoice };
