const { sequelize } = require('../models');
const { Op } = require('sequelize');  // Ensure you import Op

async function getDeletedRecords(req, res) {
    const modelName = req.params.model || 'Product';  // Default to 'Product'

    // Validate if the model name provided is valid and exists
    if (!sequelize.models[modelName]) {
        return res.status(404).json({
            message: `Model '${modelName}' not found`
        });
    }

    try {
        // Fetch deleted records from the specified model
        const records = await sequelize.models[modelName].findAll({
            where: { deletedAt: { [Op.ne]: null } },  // Correct usage of Op.ne
            attributes: { exclude: ['createdAt', 'updatedAt'] },  // Exclude certain fields
            paranoid: false  // Query also the records marked as deleted
        });

        // Respond with the deleted records
        return res.status(200).json({
            message: `Deleted records fetched successfully for model '${modelName}'`,
            data: records
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Something went wrong!',
            error: error.message
        });
    }
}

module.exports = {
    getDeletedRecords
};
