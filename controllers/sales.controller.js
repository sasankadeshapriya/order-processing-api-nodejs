const models = require('../models');
const moment = require('moment');
const { Op } = require('sequelize');

async function getSalesReport(req, res) {
    try {
        let filterOptions = {};

        // Check the filters in the query parameters
        if (req.query.start_date && req.query.end_date) {
            filterOptions.createdAt = {
                [Op.between]: [req.query.start_date, req.query.end_date]
            };
        } else if (req.query.week) {
            const startDate = moment().startOf('isoWeek').format('YYYY-MM-DD');
            const endDate = moment().endOf('isoWeek').format('YYYY-MM-DD');
            filterOptions.createdAt = {
                [Op.between]: [startDate, endDate]
            };
        } else if (req.query.day) {
            const startDate = moment().startOf('day').format('YYYY-MM-DD');
            const endDate = moment().endOf('day').format('YYYY-MM-DD');
            filterOptions.createdAt = {
                [Op.between]: [startDate, endDate]
            };
        } else if (req.query.month === 'true') {
            const startDate = moment().startOf('month').format('YYYY-MM-DD');
            const endDate = moment().endOf('month').format('YYYY-MM-DD');
            filterOptions.createdAt = {
                [Op.between]: [startDate, endDate]
            };
        } else if (req.query.year === 'true') {
            const startDate = moment().startOf('year').format('YYYY-MM-DD');
            const endDate = moment().endOf('year').format('YYYY-MM-DD');
            filterOptions.createdAt = {
                [Op.between]: [startDate, endDate]
            };
        }

        // Fetch sales records based on the filter options
        const sales = await models.Invoice.findAll({
            include: [
                {
                    model: models.Client,
                    attributes: ['name']
                }
            ],
            where: filterOptions,
            attributes: ['reference_number', 'total_amount', 'paid_amount', 'balance', 'payment_option', 'createdAt']
        });

        // Calculate sums and payment option percentages
        let totalSalesSum = 0;
        let totalPaidSum = 0;
        let totalBalanceSum = 0;
        let paymentOptionCounts = {
            credit: 0,
            cash: 0,
            cheque: 0
        };

        sales.forEach(sale => {
            totalSalesSum += parseFloat(sale.total_amount);
            totalPaidSum += parseFloat(sale.paid_amount);
            totalBalanceSum += parseFloat(sale.balance);
            if (sale.payment_option === 'cash-half') {
                paymentOptionCounts['credit']++;
            } else {
                paymentOptionCounts[sale.payment_option]++;
            }
        });

        totalSalesSum = parseFloat(totalSalesSum.toFixed(2));
        totalPaidSum = parseFloat(totalPaidSum.toFixed(2));
        totalBalanceSum = parseFloat(totalBalanceSum.toFixed(2));

        const totalSales = sales.length;
        const paymentOptionPercentages = Object.keys(paymentOptionCounts).map(option => ({
            option,
            percentage: ((paymentOptionCounts[option] / totalSales) * 100).toFixed(2)
        }));

        // Calculate previous period sums for comparison (week, day, month, year)
        const previousPeriodSums = await calculatePreviousPeriodSums(filterOptions);

        const salesComparison = calculatePercentageChange(totalSalesSum, previousPeriodSums.previousTotalSalesSum);
        const paidComparison = calculatePercentageChange(totalPaidSum, previousPeriodSums.previousTotalPaidSum);
        const balanceComparison = calculatePercentageChange(totalBalanceSum, previousPeriodSums.previousTotalBalanceSum);

        // Fetch most sold products
        const mostSoldProducts = await getMostSoldProducts(filterOptions);

        // Return the sales report in the response
        return res.status(200).json({
            sales,
            totalSalesSum,
            totalPaidSum,
            totalBalanceSum,
            paymentOptionPercentages,
            previousPeriodSums,
            mostSoldProducts,
            salesComparison,
            paidComparison,
            balanceComparison
        });
    } catch (error) {
        console.error("Failed to fetch sales report: ", error);
        return res.status(500).json({ message: "Failed to fetch sales report", error: error.message });
    }
}

async function calculatePreviousPeriodSums(currentFilterOptions) {
    const previousFilterOptions = { ...currentFilterOptions };

    // Adjust date range to the previous period for comparison
    if (previousFilterOptions.createdAt) {
        const startDate = moment(previousFilterOptions.createdAt[Op.between][0]);
        const endDate = moment(previousFilterOptions.createdAt[Op.between][1]);
        const diff = endDate.diff(startDate);

        previousFilterOptions.createdAt = {
            [Op.between]: [startDate.subtract(diff, 'ms').format('YYYY-MM-DD'), endDate.subtract(diff, 'ms').format('YYYY-MM-DD')]
        };
    }

    // Fetch sales records for the previous period
    const previousSales = await models.Invoice.findAll({
        where: previousFilterOptions,
        attributes: ['total_amount', 'paid_amount', 'balance']
    });

    let previousTotalSalesSum = 0;
    let previousTotalPaidSum = 0;
    let previousTotalBalanceSum = 0;

    previousSales.forEach(sale => {
        previousTotalSalesSum += parseFloat(sale.total_amount);
        previousTotalPaidSum += parseFloat(sale.paid_amount);
        previousTotalBalanceSum += parseFloat(sale.balance);
    });

    previousTotalSalesSum = parseFloat(previousTotalSalesSum.toFixed(2));
    previousTotalPaidSum = parseFloat(previousTotalPaidSum.toFixed(2));
    previousTotalBalanceSum = parseFloat(previousTotalBalanceSum.toFixed(2));

    return {
        previousTotalSalesSum,
        previousTotalPaidSum,
        previousTotalBalanceSum
    };
}

function calculatePercentageChange(current, previous) {
    if (previous === 0) {
        return current === 0 ? 0 : 100; // If both current and previous are zero, the change is 0%. Otherwise, it's 100% increase.
    }
    return ((current - previous) / previous * 100).toFixed(2);
}

async function getMostSoldProducts(filterOptions) {
    const productSales = await models.InvoiceDetail.findAll({
        where: filterOptions,
        attributes: ['product_id', [models.Sequelize.fn('sum', models.Sequelize.col('quantity')), 'totalQuantity']],
        group: ['product_id'],
        order: [[models.Sequelize.literal('totalQuantity'), 'DESC']]
    });

    const productIds = productSales.map(sale => sale.product_id);
    const products = await models.Product.findAll({
        where: {
            id: {
                [Op.in]: productIds
            }
        },
        attributes: ['id', 'name']
    });

    const productMap = products.reduce((acc, product) => {
        acc[product.id] = product.name;
        return acc;
    }, {});

    return productSales.map(sale => ({
        productName: productMap[sale.product_id],
        totalQuantity: sale.dataValues.totalQuantity
    }));
}

module.exports = {
    getSalesReport
};
