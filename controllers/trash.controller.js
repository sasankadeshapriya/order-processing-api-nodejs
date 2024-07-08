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

async function restoreDeletedRecord(req, res) {
    const modelName = req.params.model;
    const id = req.params.id;

    // Validate if the model name provided is valid and exists
    if (!sequelize.models[modelName]) {
        return res.status(404).json({
            message: `Model '${modelName}' not found`
        });
    }

    try {
        // Fetch the deleted record by id
        const record = await sequelize.models[modelName].findOne({
            where: { id: id },
            paranoid: false  // Query also the records marked as deleted
        });

        if (!record || !record.deletedAt) {
            return res.status(404).json({
                message: `Deleted record with id '${id}' not found in model '${modelName}'`
            });
        }

        // Restore the deleted record
        await record.restore();

        return res.status(200).json({
            message: `Record with id '${id}' restored successfully in model '${modelName}'`
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
    getDeletedRecords:getDeletedRecords,
    restoreDeletedRecord:restoreDeletedRecord
};
