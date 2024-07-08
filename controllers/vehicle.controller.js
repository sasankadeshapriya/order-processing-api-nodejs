const models = require('../models');
const validator = require('fastest-validator');

// Controller function to create a new vehicle
async function createVehicle(req, res) {
    const vehicleData = { 
        vehicle_no: req.body.vehicle_no, 
        name: req.body.name, 
        type: req.body.type,
        added_by_admin_id: req.body.added_by_admin_id,
        assigned: req.body.assigned || false // Default value for assigned
    };
    
    // Define validation schema
    const schema = {
        vehicle_no: { 
            type: 'string', 
            pattern: /^(?:[A-Za-z]{2}-\d{4}|[A-Za-z]{3}-\d{4}|\d{2}-\d{4})$/, 
            min: 1, 
            max: 10 
        },
        name: { type: 'string', optional: true, max: 20 },
        type: { type: 'string', enum: ['Lorry', 'Van'], max: 20 },
        added_by_admin_id: { type: 'number', positive: true, integer: true, max: 10 },
        assigned: { type: 'boolean' } // Validate assigned field
    };

    const validatorInstance = new validator();
    const validationResponse = validatorInstance.validate(vehicleData, schema);

    if (validationResponse !== true) {
        return res.status(400).json({
            message: "Vehicle Number is not valid",
            error: validationResponse
        });
    }
    
    try {
        // Check if vehicle_no is unique
        const existingVehicleNo = await models.Vehicle.findOne({ where: { vehicle_no: vehicleData.vehicle_no } });
        if (existingVehicleNo) {
            return res.status(409).json({ 
                message: 'Vehicle number already exists' 
            });
        }

        // Check if name is unique
        const existingVehicleName = await models.Vehicle.findOne({ where: { name: vehicleData.name } });
        if (existingVehicleName) {
            return res.status(409).json({ 
                message: 'Vehicle name already exists' 
            });
        }

        // Create new vehicle
        const newVehicle = await models.Vehicle.create(vehicleData);

        res.status(201).json({ message: 'Vehicle created successfully', vehicle: newVehicle });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Something went wrong!"
        });
    }
}

// Controller function to update a vehicle
async function updateVehicle(req, res) {
    const vehicleId = req.params.vehicleId;
    const updateVehicleData = {
        vehicle_no: req.body.vehicle_no, 
        name: req.body.name, 
        type: req.body.type,
        assigned: req.body.assigned || false // Default value for assigned
    };

    // Validate if vehicle number is not empty
    if (!updateVehicleData.vehicle_no) {
        return res.status(400).json({
            message: "Vehicle number cannot be empty"
        });
    }

    const schema = {
        vehicle_no: { 
            type: 'string', 
            pattern: /^(?:[A-Za-z]{2}-\d{4}|[A-Za-z]{3}-\d{4}|\d{2}-\d{4})$/, 
            min: 1, 
            max: 10 
        },
        name: { type: 'string', optional: true, max: 20 },
        type: { type: 'string', enum: ['Lorry', 'Van'], max: 20 },
        assigned: { type: 'boolean' } // Validate assigned field
    };

    const validatorInstance = new validator();
    const validationResponse = validatorInstance.validate(updateVehicleData, schema);

    if (validationResponse !== true) {
        return res.status(400).json({
            message: "Validation failed",
            error: validationResponse
        });
    }

    try {
        const vehicle = await models.Vehicle.findByPk(vehicleId);
        if (!vehicle) {
            return res.status(404).json({
                message: "Vehicle not found"
            });
        }

        // Exclude the assigned field from update if it's the current vehicle being updated
        if (updateVehicleData.assigned === undefined) {
            delete updateVehicleData.assigned;
        }

        // Check if the updated vehicle number is different and if it already exists
        if (updateVehicleData.vehicle_no !== vehicle.vehicle_no) {
            const existingVehicleNo = await models.Vehicle.findOne({ 
                where: { 
                    vehicle_no: updateVehicleData.vehicle_no,
                    id: { [models.Sequelize.Op.not]: vehicleId } // Exclude the current vehicle being updated
                } 
            });
            if (existingVehicleNo) {
                return res.status(409).json({ message: 'Vehicle number already exists' });
            }
        }

        // Check if the updated name is different and if it already exists
        if (updateVehicleData.name !== vehicle.name) {
            const existingVehicleName = await models.Vehicle.findOne({ 
                where: { 
                    name: updateVehicleData.name,
                    id: { [models.Sequelize.Op.not]: vehicleId } // Exclude the current vehicle being updated
                } 
            });
            if (existingVehicleName) {
                return res.status(409).json({ message: 'Vehicle name already exists' });
            }
        }

        await vehicle.update(updateVehicleData);

        res.status(200).json({
            message: "Vehicle updated successfully",
            vehicle: vehicle
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Something went wrong!"
        });
    }
}


// Service function to update the assigned field of a vehicle
async function updateVehicleAssigned(vehicleId, assigned) {
    try {
        const vehicle = await models.Vehicle.findByPk(vehicleId);
        if (!vehicle) {
            throw new Error("Vehicle not found");
        }

        // Update the assigned field of the vehicle
        await vehicle.update({ assigned: assigned });

        // Return the updated vehicle
        return vehicle;
    } catch(error) {
        throw new Error("Failed to update vehicle assigned field: " + error.message);
    }
}


// Controller for deleting a vehicle
async function deleteVehicle(req, res) {
    const vehicleId = req.params.vehicleId;

    try {
        const vehicle = await models.Vehicle.findByPk(vehicleId);
        if (!vehicle) {
            return res.status(404).json({
                message: "Vehicle not found"
            });
        }

        // Check if the vehicle is currently assigned
        const activeAssignment = await models.Assignment.findOne({
            where: {
                vehicle_id: vehicleId,
                deletedAt: null  // Ensure the assignment isn't already deleted
            }
        });

        if (activeAssignment) {
            return res.status(400).json({
                message: "Cannot delete vehicle because it is currently assigned."
            });
        }

        // Soft delete the vehicle
        await vehicle.destroy();
        res.status(200).json({
            message: "Vehicle deleted successfully"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Something went wrong!"
        });
    }
}

// Controller for getting all the vehicles
async function getAllVehicles(req, res) {
    try {
        // Fetch all vehicles from the database, including necessary fields
        const vehicles = await models.Vehicle.findAll({
            attributes: ['id', 'vehicle_no', 'name', 'type', 'assigned'], // Include necessary fields
            raw: true // Get raw data instead of Sequelize instances
        });

        // If there are no vehicles found
        if (!vehicles || vehicles.length === 0) {
            return res.status(404).json({ message: "No vehicles found" });
        }

        // Return the fetched vehicles
        res.status(200).json(vehicles);
    } catch (error) {
        console.error("Error fetching vehicles:", error);
        res.status(500).json({ message: "Failed to fetch vehicles" });
    }
}


//Controller for getting a specific vehicle
async function getVehicle(req,res){
    const vehicleId = req.params.vehicleId;
    try{
        const vehicle = await models.Vehicle.findByPk(vehicleId);
        if(!vehicle){
            return res.status(404).json({
                message:"Vehicle not found"
            });
        }
        res.status(200).json(vehicle);
    }catch(error){
        console.log(error);
        res.status(500).json({
            message:"Something went wrong!"
        });
    }
}

module.exports = {
    createVehicle:createVehicle,
    updateVehicle:updateVehicle,
    updateVehicleAssigned: updateVehicleAssigned,
    deleteVehicle:deleteVehicle,
    getAllVehicles:getAllVehicles,
    getVehicle:getVehicle
};
