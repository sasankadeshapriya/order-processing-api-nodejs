const models = require('../models');
const validator = require('fastest-validator');
const { Op } = require('sequelize');

// Insert a new batch
async function insertBatch(req, res) {

    const currentDate = new Date().toISOString().split('T')[0];

    const batchData = {
        sku: req.body.sku,
        product_id: req.body.product_id,
        date: currentDate,
        buy_price: req.body.buy_price,
        cash_price: req.body.cash_price,
        check_price: req.body.check_price,
        credit_price: req.body.credit_price,
        quantity: req.body.quantity,
        expire_date: req.body.expire_date,
        added_by_admin_id: req.body.added_by_admin_id
    };

    // Validation schema
    const schema = {
        sku: { type: "string", optional: false },
        product_id: { type: "number", optional: false },
        buy_price: { type: "number", optional: false },
        cash_price: { type: "number", optional: false },
        check_price: { type: "number", optional: false },
        credit_price: { type: "number", optional: false },
        quantity: { type: "number", optional: false },
        added_by_admin_id: { type: "number", optional: true }
    };

    const validatorInstance = new validator();
    const validationResponse = validatorInstance.validate(batchData, schema);

    if (validationResponse !== true) {
        return res.status(400).json({
            message: "Validation failed",
            error: validationResponse
        });
    }

    try {
        // Check if the SKU already exists
        const existingBatch = await models.Batch.findOne({ where: { sku: batchData.sku } });
        if (existingBatch) {
            return res.status(409).json({
                message: "Batch with the same SKU already exists"
            });
        }

        // Create the new batch
        const newBatch = await models.Batch.create(batchData);
        res.status(201).json({
            message: "Batch created successfully",
            batch: newBatch
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Something went wrong!"
        });
    }
}

// Update an existing batch
async function updateBatch(req, res) {

    const currentDate = new Date().toISOString().split('T')[0];

    const batchId = req.params.batchId;

    const updatedBatchData = {
        sku: req.body.sku,
        product_id: req.body.product_id,
        date: currentDate,
        buy_price: req.body.buy_price,
        cash_price: req.body.cash_price,
        check_price: req.body.check_price,
        credit_price: req.body.credit_price,
        quantity: req.body.quantity,
        expire_date: req.body.expire_date,
        added_by_admin_id: req.body.added_by_admin_id
    };

    const schema = {
        sku: { type: "string", optional: false },
        product_id: { type: "number", optional: false },
        buy_price: { type: "number", optional: false },
        cash_price: { type: "number", optional: false },
        check_price: { type: "number", optional: false },
        credit_price: { type: "number", optional: false },
        quantity: { type: "number", optional: false },
        added_by_admin_id: { type: "number", optional: true }
    };

    const validatorInstance = new validator();
    const validationResponse = validatorInstance.validate(updatedBatchData, schema);

    if (validationResponse !== true) {
        return res.status(400).json({
            message: "Validation failed",
            error: validationResponse
        });
    }

    try {
        // Check if the SKU already exists for a different batch
        const existingBatchWithSameSKU = await models.Batch.findOne({ where: { sku: updatedBatchData.sku, id: { [Op.not]: batchId } } });
        if (existingBatchWithSameSKU) {
            return res.status(409).json({
                message: "Batch with the same SKU already exists"
            });
        }

        // Find the batch by its ID
        const existingBatch = await models.Batch.findByPk(batchId);
        if (!existingBatch) {
            return res.status(404).json({
                message: "Batch not found"
            });
        }

        // Update the existing batch with the new data
        await existingBatch.update(updatedBatchData);

        res.status(200).json({
            message: "Batch updated successfully",
            batch: existingBatch
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Something went wrong!"
        });
    }
}

// Delete a batch by ID
async function deleteBatch(req, res) {
    const batchId = req.params.batchId;
    try {
        const batch = await models.Batch.findByPk(batchId);
        if (!batch) {
            return res.status(404).json({
                message: "Batch not found"
            });
        }
        await batch.destroy();
        res.status(200).json({
            message: "Batch deleted successfully"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Something went wrong!"
        });
    }
}

// Get all batches with product details
async function getAllBatches(req, res) {
    try {
        const batches = await models.Batch.findAll({
            include: [models.Product] 
        });
        res.status(200).json(batches);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Something went wrong!"
        });
    }
}


// Get a batch by ID with product details
async function getBatchById(req, res) {
    const batchId = req.params.batchId;
    try {
        const batch = await models.Batch.findByPk(batchId, {
            include: [models.Product] 
        });
        if (!batch) {
            return res.status(404).json({
                message: "Batch not found"
            });
        }
        res.status(200).json(batch);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Something went wrong!"
        });
    }
}

module.exports = {
    insertBatch:insertBatch,
    deleteBatch:deleteBatch,
    updateBatch:updateBatch,
    getAllBatches:getAllBatches,
    getBatchById:getBatchById
}