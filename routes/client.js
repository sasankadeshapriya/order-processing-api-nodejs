const express = require('express');
const clientController = require('../controllers/client.controller');

const router = express.Router();

// Existing routes
router.post('/', clientController.createClient);
router.put('/:clientId', clientController.updateClient);
router.delete('/:clientId', clientController.deleteClient);
router.get('/', clientController.getAllClients);
router.get('/:clientId', clientController.getClientById);
router.get('/route/:routeId/locations', clientController.getClientsByRouteId);

module.exports = router;
