const models = require('../models');
const validator = require('fastest-validator');

// Define schema for validation
const schema = {
    quantity: { type: 'number', positive: true, integer: true, optional: false },
    sku: { type: 'string', optional: false },
    product_id: { type: 'number', positive: true, integer: true, optional: false },
    added_by_admin_id: { type: 'number', positive: true, integer: true, optional: false },
    assignment_id: { type: 'number', positive: true, integer: true, optional: false }
};

const v = new validator();


function insertVehicleInventory(req, res) {
    const data = {
        quantity: req.body.quantity,
        sku: req.body.sku,
        product_id: req.body.product_id,
        added_by_admin_id: req.body.added_by_admin_id,
        assignment_id: req.body.assignment_id
    };

    // Validate data
    const validationResponse = v.validate(data, schema);
    if (validationResponse !== true) {
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors: validationResponse
        });
    }

    // Find batch with matching SKU and product ID
    models.Batch.findOne({ where: { sku: data.sku, product_id: data.product_id } })
        .then(batch => {
            if (!batch) {
                return res.status(404).json({
                    success: false,
                    message: 'Batch not found for the specified product and SKU'
                });
            }

            // Check if batch has sufficient quantity
            if (parseFloat(batch.quantity) < parseFloat(data.quantity)) {
                return res.status(400).json({
                    success: false,
                    message: 'Insufficient quantity in batch'
                });
            }

            // Find existing vehicle inventory with the same SKU and product ID
            models.Vehicle_inventory.findOne({ where: { sku: data.sku, product_id: data.product_id } })
                .then(vehicleInventory => {
                    if (vehicleInventory) {
                        // If record already exists, update its quantity
                        const updatedQuantity = parseFloat(vehicleInventory.quantity) + parseFloat(data.quantity);
                        vehicleInventory.update({ quantity: updatedQuantity })
                            .then(updatedVehicleInventory => {
                                // Update batch quantity
                                const updatedBatchQuantity = parseFloat(batch.quantity) - parseFloat(data.quantity);
                                batch.update({ quantity: updatedBatchQuantity })
                                    .then(() => {
                                        res.status(200).json({
                                            success: true,
                                            message: 'Vehicle inventory quantity updated successfully',
                                            vehicleInventory: updatedVehicleInventory
                                        });
                                    })
                                    .catch(error => {
                                        console.log(error);
                                        res.status(500).json({
                                            success: false,
                                            message: 'Failed to update batch quantity'
                                        });
                                    });
                            })
                            .catch(error => {
                                console.log(error);
                                res.status(500).json({
                                    success: false,
                                    message: 'Failed to update vehicle inventory quantity'
                                });
                            });
                    } else {
                        // If record doesn't exist, create a new one
                        models.Vehicle_inventory.create(data)
                            .then(newVehicleInventory => {
                                // Update batch quantity
                                const updatedBatchQuantity = parseFloat(batch.quantity) - parseFloat(data.quantity);
                                batch.update({ quantity: updatedBatchQuantity })
                                    .then(() => {
                                        res.status(200).json({
                                            success: true,
                                            message: 'Vehicle inventory added successfully',
                                            vehicleInventory: newVehicleInventory
                                        });
                                    })
                                    .catch(error => {
                                        console.log(error);
                                        res.status(500).json({
                                            success: false,
                                            message: 'Failed to update batch quantity'
                                        });
                                    });
                            })
                            .catch(error => {
                                console.log(error);
                                res.status(500).json({
                                    success: false,
                                    message: 'Failed to create vehicle inventory'
                                });
                            });
                    }
                })
                .catch(error => {
                    console.log(error);
                    res.status(500).json({
                        success: false,
                        message: 'Failed to find existing vehicle inventory'
                    });
                });
        })
        .catch(error => {
            console.log(error);
            res.status(500).json({
                success: false,
                message: 'Something went wrong while fetching batch data'
            });
        });
}

const schemaForUpdate = {
    quantity: { type: 'number', positive: true, integer: true, optional: false },
    sku: { type: 'string', optional: false },
    product_id: { type: 'number', positive: true, integer: true, optional: false },
    added_by_admin_id: { type: 'number', positive: true, integer: true, optional: false },
    assignment_id: { type: 'number', positive: true, integer: true, optional: false }
};


function updateVehicleInventory(req, res) {
    const vehicleInventoryId = req.params.vehicleInventoryId;
    const newData = {
        quantity: req.body.quantity,
        sku: req.body.sku,
        product_id: req.body.product_id,
        added_by_admin_id: req.body.added_by_admin_id,
        assignment_id: req.body.assignment_id
    };

    // Validate data
    const validationResponse = v.validate(newData, schema);
    if (validationResponse !== true) {
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors: validationResponse
        });
    }

    // Find existing vehicle inventory by ID
    models.Vehicle_inventory.findByPk(vehicleInventoryId)
        .then(vehicleInventory => {
            if (!vehicleInventory) {
                return res.status(404).json({
                    success: false,
                    message: 'Vehicle inventory not found for the specified ID'
                });
            }

            // Update vehicle inventory quantity
            vehicleInventory.update({ quantity: newData.quantity })
                .then(updatedVehicleInventory => {
                    // Find batch with matching SKU and product ID
                    models.Batch.findOne({ where: { sku: vehicleInventory.sku, product_id: vehicleInventory.product_id } })
                        .then(batch => {
                            if (!batch) {
                                return res.status(404).json({
                                    success: false,
                                    message: 'Batch not found for the specified product and SKU'
                                });
                            }

                            // Check if batch has sufficient quantity
                            if (parseFloat(batch.quantity) < parseFloat(newData.quantity)) {
                                return res.status(400).json({
                                    success: false,
                                    message: 'Insufficient quantity in batch'
                                });
                            }

                            // Update batch quantity
                            const updatedBatchQuantity = parseFloat(batch.quantity) - parseFloat(newData.quantity);
                            batch.update({ quantity: updatedBatchQuantity })
                                .then(() => {
                                    res.status(200).json({
                                        success: true,
                                        message: 'Vehicle inventory quantity updated successfully',
                                        vehicleInventory: updatedVehicleInventory
                                    });
                                })
                                .catch(error => {
                                    console.log(error);
                                    res.status(500).json({
                                        success: false,
                                        message: 'Failed to update batch quantity'
                                    });
                                });
                        })
                        .catch(error => {
                            console.log(error);
                            res.status(500).json({
                                success: false,
                                message: 'Something went wrong while fetching batch data'
                            });
                        });
                })
                .catch(error => {
                    console.log(error);
                    res.status(500).json({
                        success: false,
                        message: 'Failed to update vehicle inventory quantity'
                    });
                });
        })
        .catch(error => {
            console.log(error);
            res.status(500).json({
                success: false,
                message: 'Failed to find existing vehicle inventory'
            });
        });
}

module.exports = {
    insertVehicleInventory:insertVehicleInventory,
    updateVehicleInventory:updateVehicleInventory
}
