const express = require('express');
const vehicleInventoryController = require('../controllers/vehicleInventory.controller');

const router = express.Router();

router.post('/', vehicleInventoryController.insertVehicleInventory);
router.put('/:vehicleInventoryId', vehicleInventoryController.updateVehicleInventory);
router.delete('/:vehicleInventoryId', vehicleInventoryController.deleteVehicleInventory);
router.get('/:vehicleInventoryId', vehicleInventoryController.getVehicleInventoryById);
router.get('/', vehicleInventoryController.getAllVehicleInventories);


// /vehicle-inventory?in_stock=true --> to get above qty 0

module.exports = router;