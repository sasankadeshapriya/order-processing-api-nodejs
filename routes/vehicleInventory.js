const express = require('express');
const vehicleInventoryController = require('../controllers/vehicleInventory.controller');

const router = express.Router();

router.post('/', vehicleInventoryController.insertVehicleInventory);
router.put('/:vehicleInventoryId', vehicleInventoryController.updateVehicleInventory);

module.exports = router;