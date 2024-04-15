const express = require('express');
const routeController = require('../controllers/route.controller');

const router = express.Router();

// Create a new route
router.post('/', routeController.createRoute);
// Update the details of an existing route
router.put('/:routeId', routeController.updateRoute);
// Update the assigned field of a route
router.patch('/:routeId/assigned', routeController.updateRouteAssigned);
// Delete a route
router.delete('/:routeId', routeController.deleteRoute);
// Get all routes
router.get('/', routeController.getAllRoutes);
// Get details of a specific route
router.get('/:routeId', routeController.getRoute);

module.exports = router;