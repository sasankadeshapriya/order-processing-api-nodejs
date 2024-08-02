const models = require('../models');
const validator = require('fastest-validator');
const { Op } = require('sequelize');

// Define schema for validation
const schema = {
    quantity: { type: 'number', positive: true, integer: false, optional: false },
    sku: { type: 'string', optional: false },
    product_id: { type: 'number', positive: true, integer: true, optional: false },
    added_by_admin_id: { type: 'number', positive: true, integer: true, optional: false },
    assignment_id: { type: 'number', positive: true, integer: true, optional: false }
};

const v = new validator();


// function insertVehicleInventory(req, res) {
//     const data = {
//         quantity: req.body.quantity,
//         sku: req.body.sku,
//         product_id: req.body.product_id,
//         added_by_admin_id: req.body.added_by_admin_id,
//         assignment_id: req.body.assignment_id,
//         intialqty: req.body.quantity
//     };

//     // Validate data
//     const validationResponse = v.validate(data, schema);
//     if (validationResponse !== true) {
//         return res.status(400).json({
//             success: false,
//             message: 'Validation error',
//             errors: validationResponse
//         });
//     }

//     // Find batch with matching SKU and product ID
//     models.Batch.findOne({ where: { sku: data.sku, product_id: data.product_id } })
//         .then(batch => {
//             if (!batch) {
//                 return res.status(404).json({
//                     success: false,
//                     message: 'Batch not found for the specified product and SKU'
//                 });
//             }

//             // Check if batch has sufficient quantity
//             if (parseFloat(batch.quantity) < parseFloat(data.quantity)) {
//                 return res.status(400).json({
//                     success: false,
//                     message: 'Insufficient quantity in batch'
//                 });
//             }

//             // Find existing vehicle inventory with the same SKU and product ID
//             models.Vehicle_inventory.findOne({ where: { assignment_id:data.assignment_id, sku: data.sku, product_id: data.product_id } })
//                 .then(vehicleInventory => {
//                     if (vehicleInventory) {
//                         // If record already exists, update its quantity
//                         const updatedQuantity = parseFloat(vehicleInventory.quantity) + parseFloat(data.quantity);
//                         vehicleInventory.update({ quantity: updatedQuantity, intialqty: updatedQuantity })
//                             .then(updatedVehicleInventory => {
//                                 // Update batch quantity
//                                 const updatedBatchQuantity = parseFloat(batch.quantity) - parseFloat(data.quantity);
//                                 batch.update({ quantity: updatedBatchQuantity })
//                                     .then(() => {
//                                         res.status(200).json({
//                                             success: true,
//                                             message: 'Vehicle inventory quantity updated successfully',
//                                             vehicleInventory: updatedVehicleInventory
//                                         });
//                                     })
//                                     .catch(error => {
//                                         console.log(error);
//                                         res.status(500).json({
//                                             success: false,
//                                             message: 'Failed to update batch quantity'
//                                         });
//                                     });
//                             })
//                             .catch(error => {
//                                 console.log(error);
//                                 res.status(500).json({
//                                     success: false,
//                                     message: 'Failed to update vehicle inventory quantity'
//                                 });
//                             });
//                     } else {
//                         // If record doesn't exist, create a new one
//                         models.Vehicle_inventory.create(data)
//                             .then(newVehicleInventory => {
//                                 // Update batch quantity
//                                 const updatedBatchQuantity = parseFloat(batch.quantity) - parseFloat(data.quantity);
//                                 batch.update({ quantity: updatedBatchQuantity })
//                                     .then(() => {
//                                         res.status(200).json({
//                                             success: true,
//                                             message: 'Vehicle inventory added successfully',
//                                             vehicleInventory: newVehicleInventory
//                                         });
//                                     })
//                                     .catch(error => {
//                                         console.log(error);
//                                         res.status(500).json({
//                                             success: false,
//                                             message: 'Failed to update batch quantity'
//                                         });
//                                     });
//                             })
//                             .catch(error => {
//                                 console.log(error);
//                                 res.status(500).json({
//                                     success: false,
//                                     message: 'Failed to create vehicle inventory'
//                                 });
//                             });
//                     }
//                 })
//                 .catch(error => {
//                     console.log(error);
//                     res.status(500).json({
//                         success: false,
//                         message: 'Failed to find existing vehicle inventory'
//                     });
//                 });
//         })
//         .catch(error => {
//             console.log(error);
//             res.status(500).json({
//                 success: false,
//                 message: 'Something went wrong while fetching batch data'
//             });
//         });
// }

function insertVehicleInventory(req, res) {
    const data = {
        quantity: req.body.quantity,
        sku: req.body.sku,
        product_id: req.body.product_id,
        added_by_admin_id: req.body.added_by_admin_id,
        assignment_id: req.body.assignment_id,
        intialqty: req.body.quantity
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

    // Check if the assignment_id exists in the Assignment model
    models.Assignment.findByPk(data.assignment_id)
        .then(assignment => {
            if (!assignment) {
                return res.status(404).json({
                    success: false,
                    message: 'Assignment not found'
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
                    models.Vehicle_inventory.findOne({ where: { assignment_id: data.assignment_id, sku: data.sku, product_id: data.product_id } })
                        .then(vehicleInventory => {
                            if (vehicleInventory) {
                                // If record already exists, update its quantity
                                const updatedQuantity = parseFloat(vehicleInventory.quantity) + parseFloat(data.quantity);
                                vehicleInventory.update({ quantity: updatedQuantity, intialqty: updatedQuantity })
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
        })
        .catch(error => {
            console.log(error);
            res.status(500).json({
                success: false,
                message: 'Failed to verify assignment ID'
            });
        });
}


// update inventory by id
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

            // Calculate the difference in quantity
            const oldQuantity = vehicleInventory.quantity;
            const difference = newData.quantity - oldQuantity;

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
                    if (parseFloat(batch.quantity) < parseFloat(difference)) {
                        return res.status(400).json({
                            success: false,
                            message: 'Insufficient quantity in batch'
                        });
                    }

                    // Update batch quantity based on the difference
                    const updatedBatchQuantity = parseFloat(batch.quantity) - parseFloat(difference);
                    batch.update({ quantity: updatedBatchQuantity })
                        .then(() => {
                            // Update vehicle inventory quantity
                            vehicleInventory.update({ quantity: newData.quantity })
                                .then(updatedVehicleInventory => {
                                    res.status(200).json({
                                        success: true,
                                        message: 'Vehicle inventory quantity updated successfully',
                                        vehicleInventory: updatedVehicleInventory
                                    });
                                })
                                .catch(error => {
                                    console.log(error);
                                    // Roll back batch quantity update
                                    batch.update({ quantity: parseFloat(batch.quantity) + parseFloat(difference) })
                                        .then(() => {
                                            res.status(500).json({
                                                success: false,
                                                message: 'Failed to update vehicle inventory quantity'
                                            });
                                        })
                                        .catch(error => {
                                            console.log(error);
                                            res.status(500).json({
                                                success: false,
                                                message: 'Failed to roll back batch quantity update'
                                            });
                                        });
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
                message: 'Failed to find existing vehicle inventory'
            });
        });
}

//delete quentity
function deleteVehicleInventory(req, res) {
    const vehicleInventoryId = req.params.vehicleInventoryId;

    // Find existing vehicle inventory by ID
    models.Vehicle_inventory.findByPk(vehicleInventoryId)
        .then(vehicleInventory => {
            if (!vehicleInventory) {
                return res.status(404).json({
                    success: false,
                    message: 'Vehicle inventory not found for the specified ID'
                });
            }

            // Get quantity of the vehicle inventory to be deleted
            const quantityToDelete = parseFloat(vehicleInventory.quantity);

            // Find batch with matching SKU and product ID
            models.Batch.findOne({ where: { sku: vehicleInventory.sku, product_id: vehicleInventory.product_id } })
                .then(batch => {
                    if (!batch) {
                        return res.status(404).json({
                            success: false,
                            message: 'Batch not found for the specified product and SKU'
                        });
                    }
                    
                    // Update batch quantity by adding the quantity of the vehicle inventory to be deleted
                    const updatedBatchQuantity = parseFloat(batch.quantity) + quantityToDelete;
                    batch.update({ quantity: updatedBatchQuantity })
                        .then(() => {
                            // Delete the vehicle inventory row with softdelete
                            vehicleInventory.destroy()
                                .then(() => {
                                    res.status(200).json({
                                        success: true,
                                        message: 'Vehicle inventory deleted successfully'
                                    });
                                })
                                .catch(error => {
                                    console.log(error);
                                    res.status(500).json({
                                        success: false,
                                        message: 'Failed to delete vehicle inventory'
                                    });
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
                message: 'Failed to find existing vehicle inventory'
            });
        });
}

// get by id
// function getAllVehicleInventories(req, res) {
//     const { in_stock } = req.query;
//     let filter = {};
    
//     if (in_stock && in_stock.toLowerCase() === 'true') {
//         filter.quantity = { [Op.gt]: 0 }; // Filter for quantity greater than 0
//     }

//     // Find all vehicle inventories matching the filter
//     models.Vehicle_inventory.findAll({ where: filter })
//         .then(vehicleInventories => {
//             res.status(200).json({
//                 success: true,
//                 message: 'Vehicle inventories retrieved successfully',
//                 vehicleInventories: vehicleInventories
//             });
//         })
//         .catch(error => {
//             console.log(error);
//             res.status(500).json({
//                 success: false,
//                 message: 'Failed to retrieve vehicle inventories'
//             });
//         });
// }

// get all vehicle inventories with detailed information
function getAllVehicleInventories(req, res) {
    const { in_stock } = req.query;
    let filter = {};
    
    if (in_stock && in_stock.toLowerCase() === 'true') {
        filter.quantity = { [Op.gt]: 0 }; // Filter for quantity greater than 0
    }

    // Find all vehicle inventories matching the filter and include related data
    models.Vehicle_inventory.findAll({
        where: filter,
        include: [{
            model: models.Assignment,
            include: [
                { model: models.Employee },
                { model: models.Vehicle },
                { model: models.Route }
            ]
        }, {
            model: models.Product
        }]
    })
    .then(vehicleInventories => {
        res.status(200).json({
            success: true,
            message: 'Vehicle inventories retrieved successfully',
            vehicleInventories: vehicleInventories
        });
    })
    .catch(error => {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve vehicle inventories'
        });
    });
}


// get all
// function getVehicleInventoryById(req, res) {
//     const vehicleInventoryId = req.params.vehicleInventoryId;

//     // Find vehicle inventory by ID
//     models.Vehicle_inventory.findByPk(vehicleInventoryId)
//         .then(vehicleInventory => {
//             if (!vehicleInventory) {
//                 return res.status(404).json({
//                     success: false,
//                     message: 'Vehicle inventory not found for the specified ID'
//                 });
//             }

//             res.status(200).json({
//                 success: true,
//                 message: 'Vehicle inventory retrieved successfully',
//                 vehicleInventory: vehicleInventory
//             });
//         })
//         .catch(error => {
//             console.log(error);
//             res.status(500).json({
//                 success: false,
//                 message: 'Failed to retrieve vehicle inventory'
//             });
//         });
// }

// get a single vehicle inventory by id with detailed information
function getVehicleInventoryById(req, res) {
    const vehicleInventoryId = req.params.vehicleInventoryId;

    // Find vehicle inventory by ID and include related data
    models.Vehicle_inventory.findByPk(vehicleInventoryId, {
        include: [{
            model: models.Assignment,
            include: [
                { model: models.Employee },
                { model: models.Vehicle },
                { model: models.Route }
            ]
        }, {
            model: models.Product
        }]
    })
    .then(vehicleInventory => {
        if (!vehicleInventory) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle inventory not found for the specified ID'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Vehicle inventory retrieved successfully',
            vehicleInventory: vehicleInventory
        });
    })
    .catch(error => {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve vehicle inventory'
        });
    });
}


// update inventory by id for admin
function updateVehicleInventoryAdmin(req, res) {
    const vehicleInventoryId = req.params.vehicleInventoryId;
    const newData = {
        quantity: req.body.quantity,
        sku: req.body.sku,
        product_id: req.body.product_id,
        added_by_admin_id: req.body.added_by_admin_id,
        assignment_id: req.body.assignment_id,
        intialqty: req.body.quantity
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

            // Calculate the difference in quantity
            const oldQuantity = vehicleInventory.quantity;
            const difference = newData.quantity - oldQuantity;

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
                    if (parseFloat(batch.quantity) < parseFloat(difference)) {
                        return res.status(400).json({
                            success: false,
                            message: 'Insufficient quantity in batch'
                        });
                    }

                    // Update batch quantity based on the difference
                    const updatedBatchQuantity = parseFloat(batch.quantity) - parseFloat(difference);
                    batch.update({ quantity: updatedBatchQuantity })
                        .then(() => {
                            // Update vehicle inventory quantity
                            vehicleInventory.update({ quantity: newData.quantity, intialqty: newData.quantity })
                                .then(updatedVehicleInventory => {
                                    res.status(200).json({
                                        success: true,
                                        message: 'Vehicle inventory quantity updated successfully',
                                        vehicleInventory: updatedVehicleInventory
                                    });
                                })
                                .catch(error => {
                                    console.log(error);
                                    // Roll back batch quantity update
                                    batch.update({ quantity: parseFloat(batch.quantity) + parseFloat(difference) })
                                        .then(() => {
                                            res.status(500).json({
                                                success: false,
                                                message: 'Failed to update vehicle inventory quantity'
                                            });
                                        })
                                        .catch(error => {
                                            console.log(error);
                                            res.status(500).json({
                                                success: false,
                                                message: 'Failed to roll back batch quantity update'
                                            });
                                        });
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
                message: 'Failed to find existing vehicle inventory'
            });
        });
}


// Toggle the 'looked' field of a vehicle inventory record
async function toggleLookedField(req, res) {
    const vehicleInventoryId = req.params.vehicleInventoryId;

    try {
        const inventory = await models.Vehicle_inventory.findByPk(vehicleInventoryId);
        if (!inventory) {
            return res.status(404).json({
                message: "Vehicle inventory not found"
            });
        }

        // Toggle the 'looked' field
        inventory.looked = !inventory.looked;
        await inventory.save();

        return res.status(200).json({
            message: "Vehicle inventory 'looked' status toggled successfully",
            vehicleInventory: inventory
        });
    } catch (error) {
        console.error("Error toggling 'looked' status:", error);
        return res.status(500).json({
            message: "Failed to toggle 'looked' status",
            error: error.message
        });
    }
}


module.exports = {
    insertVehicleInventory:insertVehicleInventory,
    updateVehicleInventory:updateVehicleInventory,
    deleteVehicleInventory:deleteVehicleInventory,
    getAllVehicleInventories: getAllVehicleInventories,
    getVehicleInventoryById: getVehicleInventoryById,
    updateVehicleInventoryAdmin:updateVehicleInventoryAdmin,
    toggleLookedField:toggleLookedField
}
