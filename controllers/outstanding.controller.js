const { Client, Invoice, Sequelize } = require('../models'); // Adjust the path as per your project structure
const { Op } = Sequelize;
const moment = require('moment');

async function getClientsWithOutstandingBalances(req, res) {
    try {
        // Determine the date range based on the filter
        let dateFilter = {};
        const { filter = 'month', start_date, end_date } = req.query;

        switch (filter) {
            case 'day':
                dateFilter = {
                    createdAt: {
                        [Op.gte]: moment().startOf('day').toDate(),
                        [Op.lt]: moment().endOf('day').toDate()
                    }
                };
                break;
            case 'week':
                dateFilter = {
                    createdAt: {
                        [Op.gte]: moment().startOf('week').toDate(),
                        [Op.lt]: moment().endOf('week').toDate()
                    }
                };
                break;
            case 'month':
                dateFilter = {
                    createdAt: {
                        [Op.gte]: moment().startOf('month').toDate(),
                        [Op.lt]: moment().endOf('month').toDate()
                    }
                };
                break;
            case 'year':
                dateFilter = {
                    createdAt: {
                        [Op.gte]: moment().startOf('year').toDate(),
                        [Op.lt]: moment().endOf('year').toDate()
                    }
                };
                break;
            case 'all':
                // No date filter for 'all'
                dateFilter = {};
                break;
            case 'custom':
                if (start_date && end_date) {
                    dateFilter = {
                        createdAt: {
                            [Op.gte]: moment(start_date).startOf('day').toDate(),
                            [Op.lt]: moment(end_date).endOf('day').toDate()
                        }
                    };
                } else {
                    return res.status(400).json({ message: "Custom range requires start_date and end_date" });
                }
                break;
            default:
                dateFilter = {
                    createdAt: {
                        [Op.gte]: moment().startOf('month').toDate(),
                        [Op.lt]: moment().endOf('month').toDate()
                    }
                };
                break;
        }

        // Fetch invoices with outstanding balance and include client details
        const invoices = await Invoice.findAll({
            where: {
                balance: {
                    [Op.gt]: 0.00
                },
                ...dateFilter
            },
            attributes: [
                'client_id',
                'reference_number',
                'total_amount',
                'balance',
                'credit_period_end_date',
                'paid_amount'
            ],
            include: [{
                model: Client,
                attributes: ['name', 'phone_no']
            }],
            order: [['credit_period_end_date', 'ASC']]
        });

        // Group invoices by client_id and aggregate balances
        const clientBalances = invoices.reduce((acc, invoice) => {
            const clientId = invoice.client_id;
            if (!acc[clientId]) {
                acc[clientId] = {
                    name: invoice.Client.name,
                    phone_no: invoice.Client.phone_no,
                    total_outstanding_balance: 0,
                    total_amount: 0,
                    paid_amount: 0,
                    invoices: []
                };
            }
            acc[clientId].total_outstanding_balance += parseFloat(invoice.balance);
            acc[clientId].total_amount += parseFloat(invoice.total_amount);
            acc[clientId].paid_amount += parseFloat(invoice.paid_amount);
            acc[clientId].invoices.push({
                reference_number: invoice.reference_number,
                balance: invoice.balance,
                total_amount: invoice.total_amount,
                credit_period_end_date: invoice.credit_period_end_date,
                paid_amount: invoice.paid_amount
            });
            return acc;
        }, {});

        // Calculate percentage for each client and for the overall filter range
        const result = Object.values(clientBalances)
            .map(client => {
                const paid_percentage = (client.paid_amount / client.total_amount) * 100;
                const unpaid_percentage = (client.total_outstanding_balance / client.total_amount) * 100;
                return {
                    ...client,
                    paid_percentage: paid_percentage.toFixed(2),
                    unpaid_percentage: unpaid_percentage.toFixed(2),
                    invoices: client.invoices.sort((a, b) => new Date(a.credit_period_end_date) - new Date(b.credit_period_end_date))
                };
            })
            .sort((a, b) => new Date(a.invoices[0].credit_period_end_date) - new Date(b.invoices[0].credit_period_end_date));

        // Calculate overall percentages for the selected date range
        const totalAmounts = invoices.reduce((acc, invoice) => {
            acc.total_amount += parseFloat(invoice.total_amount);
            acc.total_paid += parseFloat(invoice.paid_amount);
            acc.total_balance += parseFloat(invoice.balance);
            return acc;
        }, { total_amount: 0, total_paid: 0, total_balance: 0 });

        const overallPaidPercentage = (totalAmounts.total_paid / totalAmounts.total_amount) * 100;
        const overallUnpaidPercentage = (totalAmounts.total_balance / totalAmounts.total_amount) * 100;

        // Return the result
        return res.status(200).json({
            clients: result,
            overall: {
                total_amount: totalAmounts.total_amount.toFixed(2),
                total_paid: totalAmounts.total_paid.toFixed(2),
                total_balance: totalAmounts.total_balance.toFixed(2),
                paid_percentage: overallPaidPercentage.toFixed(2),
                unpaid_percentage: overallUnpaidPercentage.toFixed(2)
            }
        });
    } catch (error) {
        console.error("Failed to fetch clients with outstanding balances: ", error);
        return res.status(500).json({ message: "Failed to fetch clients with outstanding balances" });
    }
}

module.exports = {
    getClientsWithOutstandingBalances
};
