const express = require('express');
const vehicleController = require('../controllers/vehicle.controller');

const router = express.Router();

// Create a new vehicle
router.post('/', vehicleController.createVehicle);
// Update the details of an existing vehicle
router.put('/:vehicleId', vehicleController.updateVehicle);
// Delete a vehicle
router.delete('/:vehicleId', vehicleController.deleteVehicle);
// Get all vehicles
router.get('/', vehicleController.getAllVehicles);
// Get details of a specific vehicle
router.get('/:vehicleId', vehicleController.getVehicle);

module.exports = router;
