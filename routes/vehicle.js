const express = require('express');
const vehicleController = require('../controllers/vehicle.controller');

const router = express.Router();

// Route to create a new vehicle
router.post('/', vehicleController.createVehicle);
router.put('/:vehicleId', vehicleController.updateVehicle);
router.delete('/:vehicleId', vehicleController.deleteVehicle);
router.get('/', vehicleController.getAllVehicles);
router.get('/:vehicleId', vehicleController.getVehicle);

module.exports = router;
