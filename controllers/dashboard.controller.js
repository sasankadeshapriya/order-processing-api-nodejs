const { Op } = require('sequelize');
const models = require('../models'); // Adjust the path to your models

async function getSummaryData(req, res) {
    try {
        // Calculate total amount from Invoices excluding deleted records
        const totalAmount = await models.Invoice.sum('total_amount', {
            where: {
                deletedAt: { [Op.is]: null }
            }
        });

        // Calculate total amount from Payments excluding deleted, not-verified, and rejected records
        const totalPaidAmount = await models.Payment.sum('amount', {
            where: {
                deletedAt: { [Op.is]: null },
                state: { [Op.notIn]: ['not-verified', 'rejected'] }
            }
        });

        // Count Routes excluding deleted records
        const routeCount = await models.Route.count({
            where: {
                deletedAt: { [Op.is]: null }
            }
        });

        // Count Products excluding deleted records
        const productCount = await models.Product.count({
            where: {
                deletedAt: { [Op.is]: null }
            }
        });

        // Get sold products and their count within the month from InvoiceDetails
        const soldProducts = await models.InvoiceDetail.findAll({
            attributes: [
                'product_id',
                [models.sequelize.fn('SUM', models.sequelize.col('quantity')), 'total_quantity']
            ],
            where: {
                deletedAt: { [Op.is]: null },
                createdAt: {
                    [Op.gte]: models.sequelize.literal("DATE_SUB(NOW(), INTERVAL 1 MONTH)")
                }
            },
            group: ['product_id'],
            raw: true
        });

        // Fetch product details and include 'NA' for deleted products
        const soldProductDetails = await Promise.all(soldProducts.map(async (item) => {
            const product = await models.Product.findOne({
                where: {
                    id: item.product_id
                },
                paranoid: false
            });

            return {
                product_id: item.product_id,
                product_name: product ? product.name : 'NA',
                total_quantity: item.total_quantity,
                product_code: product.product_code
            };
        }));

        // Send the response
        res.status(200).json({
            totalAmount,
            totalPaidAmount,
            routeCount,
            productCount,
            soldProductDetails
        });

    } catch (error) {
        console.error("Error fetching summary data:", error);
        res.status(500).json({ message: "Failed to fetch summary data" });
    }
}

module.exports = {
    getSummaryData
};
