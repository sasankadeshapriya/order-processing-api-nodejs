const express = require('express');
const vehicleController = require('../controllers/vehicle.controller');
const router = express.Router();

// Create a new vehicle
router.post('/', vehicleController.createVehicle);
// Update a vehicle
router.put('/:vehicleId', vehicleController.updateVehicle);
// Update the assigned field of a vehicle
router.put('/:vehicleId/assigned', vehicleController.updateVehicleAssigned);
// Delete a vehicle
router.delete('/:vehicleId', vehicleController.deleteVehicle);
// Get all vehicles
router.get('/', vehicleController.getAllVehicles);
// Get a specific vehicle
router.get('/:vehicleId', vehicleController.getVehicle);

module.exports = router;
