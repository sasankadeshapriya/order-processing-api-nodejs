const models = require('../models');
const validator = require('fastest-validator');

// Controller function to create a new route
async function createRoute(req, res) {
  const routeData = {
    name: req.body.name,
    waypoints: req.body.waypoints, 
    added_by_admin_id: req.body.added_by_admin_id,
  };

  const schema = {
    name: { type: "string", empty: false, messages: { required: "Route Name is required" } },
    waypoints: { type: "string", empty: false, messages: { required: "Waypoints are required" } },
    added_by_admin_id: { type: "number", empty: false, messages: { required: "Added by Admin ID is required" } }
  };

  const validatorInstance = new validator();
  const validationResponse = validatorInstance.validate(routeData, schema);

  if (validationResponse !== true) {
    return res.status(400).json({
        message: "Validation failed",
        error: validationResponse
    });
  }

  try {
    // Check if route name is unique
    const existingRoute = await models.Route.findOne({ where: { name: routeData.name } });
    if (existingRoute) {
      return res.status(409).json({ message: 'Route name already exists' });
    }

    // Create new route
    const newRoute = await models.Route.create(routeData);

    res.status(201).json({ message: 'Route created successfully', route: newRoute });

  } catch (error) {
    console.error("Error creating route:", error.message);
    res.status(500).json({ message: "An error occurred while creating the route" });
  }
}

//Controller function to update a route
async function updateRoute(req,res){
    const routeId = req.params.routeId;
    const updateRouteData = {
        name: req.body.name,
        waypoints: req.body.waypoints, 
        added_by_admin_id: req.body.added_by_admin_id,
      };

    const schema = {
        name: { type: "string", empty: false, messages: { required: "Route Name is required" } },
        waypoints: { type: "string", empty: false, messages: { required: "Waypoints are required" } },
        added_by_admin_id: { type: "number", empty: false, messages: { required: "Added by Admin ID is required" } }
    };

    const validatorInstance = new validator();
    const validationResponse = validatorInstance.validate(updateRouteData, schema);
  
    if (validationResponse !== true) {
      return res.status(400).json({
          message: "Validation failed",
          error: validationResponse
      });
    }

    try{
        const existingRoute = await models.Route.findOne({ where: { name: updateRouteData.name } });
        if (existingRoute && existingRoute.id !== routeId) {
            return res.status(409).json({ message: 'Route name already exists' });
        }

        const route = await models.Route.findByPk(routeId);
        if(!route){
            return res.status(404).json({
                message: "Route not found"
            });
        }

        await route.update(updateRouteData);

        res.status(200).json({
            message:"Route updated successfully",
            route:route
        });

    }catch(error){
        console.log(error);
        res.status(500).json({
            message:"Something went wrong!"
        });
    }
}

//Controller for deleting a vehicle
async function deleteRoute(req,res){
    const routeId = req.params.routeId;

    try{
        const route = await models.Route.findByPk(routeId);
        if(!route){
            return res.status(404).json({
                message: "Route not found"
            });
        }

        await route.destroy();
        res.status(200).json({
            message:"Route deleted successfully"
        });
    }catch(error){
        console.log(error);
        res.status(500).json({
            message:"Something went wrong!"
        });
    }
}
    //Controller for getting all the vehicles
    async function getAllRoutes(req,res){
        try{
            const routes = await models.Route.findAll();
            res.status(200).json(routes);
        }catch(error){
            console.log(error);
            res.status(500).json({
                message: "Something went wrong!"
            });
        }
}

    //Controller for getting a vehicles
    async function getRoute(req,res){
        const routeId = req.params.routeId;

        try{
            const route = await models.Route.findByPk(routeId);
            if(!route){
                return res.status(404).json({
                    message: "Route not found"
                });
            }
            res.status(200).json(route);
        }catch(error){
            console.log(error);
            res.status(500).json({
                message: "Something went wrong!"
            });
        }
}

module.exports = {
  createRoute: createRoute,
  updateRoute: updateRoute,
  deleteRoute: deleteRoute,
  getAllRoutes: getAllRoutes,
  getRoute: getRoute
};
