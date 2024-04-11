const express = require('express');
const routeController = require('../controllers/route.controller');

const router = express.Router();

router.post('/', routeController.createRoute);
router.put('/:routeId', routeController.updateRoute);
router.delete('/:routeId', routeController.deleteRoute);
router.get('/', routeController.getAllRoutes);
router.get('/:routeId', routeController.getRoute);

module.exports = router;