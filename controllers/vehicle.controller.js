const models = require('../models');
const validator = require('fastest-validator');

// Controller function to create a new vehicle
async function createVehicle(req, res) {
        const vehicleData = { 
            vehicle_no: req.body.vehicle_no, 
            name: req.body.name, 
            type: req.body.type,
            added_by_admin_id: req.body.added_by_admin_id
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
            added_by_admin_id: { type: 'number', positive: true, integer: true, max: 10 }
        };

        const validatorInstance = new validator();
        const validationResponse = validatorInstance.validate(vehicleData, schema);

        if (validationResponse !== true) {
            return res.status(400).json({
                message: "Validation failed",
                error: validationResponse
            });
        }
    try{
        // Check if vehicle_no is unique
        const existingVehicle = await models.Vehicle.findOne({ where: { vehicle_no: vehicleData.vehicle_no } });
        if (existingVehicle) {
            return res.status(409).json({ message: 'Vehicle number already exists' });
        }
        

        // Create new vehicle
        const newVehicle = await models.Vehicle.create(vehicleData);

        res.status(201).json({ message: 'Vehicle created successfully', vehicle: newVehicle });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Something went wrong!"
        });
    }
    }

//Controller function to update a vehicle
async function updateVehicle(req, res) {
    const vehicleId = req.params.vehicleId;
    const updateVehicleData = {
        vehicle_no: req.body.vehicle_no, 
        name: req.body.name, 
        type: req.body.type,
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
    };

    const validatorInstance = new validator();
    const validationResponse = validatorInstance.validate(updateVehicleData, schema);

    if(validationResponse !== true){
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
    
        // Check if the updated vehicle number is different and if it already exists
        if (updateVehicleData.vehicle_no !== vehicle.vehicle_no) {
            const existingVehicle = await models.Vehicle.findOne({ 
                where: { 
                    vehicle_no: updateVehicleData.vehicle_no,
                    id: { [models.Sequelize.Op.not]: vehicleId } // Exclude the current vehicle being updated
                } 
            });
            if (existingVehicle) {
                return res.status(409).json({ message: 'Vehicle number already exists' });
            }
        }
    
        await vehicle.update(updateVehicleData);
    
        res.status(200).json({
            message: "Vehicle updated successfully",
            vehicle: vehicle
        });
    
    } catch(error) {
        console.log(error);
        res.status(500).json({
            message: "Something went wrong!"
        });
    }
    
}


//Controller for deleting a vehicle
async function deleteVehicle(req,res){
    const vehicleId = req.params.vehicleId;

    try{
        const vehicle = await models.Vehicle.findByPk(vehicleId);
        if(!vehicle){
            return res.status(404).json({
                message:"Vehicle not found"
            });
        }

        await vehicle.destroy();
        res.status(200).json({
            message: "Product deleted successfully"
        });
    }catch(error){
        console.log(error);
        res.status(500).json({
            message:"Something went wrong!"
        });
    }
}

//Controller for getting all the vehicles
async function getAllVehicles(req,res){
    try{
        const vehicles = await models.Vehicle.findAll();
        res.status(200).json(vehicles);
    }catch(error){
        console.log(error);
        res.status(500).json({
            message: "Something went wrong!"
        });
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
    deleteVehicle:deleteVehicle,
    getAllVehicles:getAllVehicles,
    getVehicle:getVehicle
};
