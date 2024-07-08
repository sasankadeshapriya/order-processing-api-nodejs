const models = require('../models');

async function getDayEndReport(req, res) {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const nextDate = new Date(currentDate.getTime() + 86400000); // Plus one day

    try {
        const totalSales = await models.Invoice.sum('total_amount', {
            where: { createdAt: { [models.Sequelize.Op.gte]: currentDate, [models.Sequelize.Op.lt]: nextDate } }
        });
        const totalCommission = await models.Commission.sum('commission', {
            where: { updatedAt: { [models.Sequelize.Op.gte]: currentDate, [models.Sequelize.Op.lt]: nextDate } }
        });
        const paymentsReceived = await models.Payment.findAll({
            attributes: ['payment_option', [models.Sequelize.fn('sum', models.Sequelize.col('amount')), 'total_amount']],
            group: ['payment_option'],
            where: { createdAt: { [models.Sequelize.Op.gte]: currentDate, [models.Sequelize.Op.lt]: nextDate } },
            raw: true
        });
        const assignmentsCount = await models.Assignment.count({
            where: { updatedAt: { [models.Sequelize.Op.gte]: currentDate, [models.Sequelize.Op.lt]: nextDate } }
        });

        const invoiceDetails = await models.InvoiceDetail.findAll({
            where: { createdAt: { [models.Sequelize.Op.gte]: currentDate, [models.Sequelize.Op.lt]: nextDate } },
            raw: true
        });

        const batchSkus = invoiceDetails.map(detail => detail.batch_id);
        const batches = await models.Batch.findAll({
            where: { sku: batchSkus },
            include: [{ model: models.Product, attributes: ['name', 'product_code'], paranoid: false }],
            raw: true,
            nest: true,
            paranoid: false
        });

        // Map Batches to Products for easy access
        const batchMap = batches.reduce((acc, batch) => {
            acc[batch.sku] = { sku: batch.sku, productName: batch.Product.name, productCode: batch.Product.product_code };
            return acc;
        }, {});

        // Aggregate products sold
        const productSales = invoiceDetails.reduce((acc, detail) => {
            const batch = batchMap[detail.batch_id];
            const key = batch ? `${batch.productCode}-${batch.sku}` : 'Unknown Product';
            if (!acc[key]) {
                acc[key] = {
                    quantity: 0,
                    sku: batch ? batch.sku : 'SKU Not Found',
                    productName: batch ? batch.productName : 'Product Not Found',
                    productCode: batch ? batch.productCode : 'Code Not Found'
                };
            }
            acc[key].quantity += parseFloat(detail.quantity);
            return acc;
        }, {});

        res.status(200).json({
            totalSales: totalSales || 0,
            totalCommission: totalCommission || 0,
            productsSold: Object.values(productSales),
            paymentsReceived: paymentsReceived,
            assignmentsCount: assignmentsCount
        });

    } catch (error) {
        console.error("Failed to fetch day end report data:", error);
        res.status(500).json({
            message: "Failed to fetch day end report",
            error: error.message
        });
    }
}

module.exports = {
    getDayEndReport
};
