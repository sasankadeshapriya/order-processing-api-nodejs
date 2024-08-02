const models = require('../models');
const validator = require('fastest-validator');

// Controller function to create a new route
async function createRoute(req, res) {
    const routeData = {
      name: req.body.name,
      waypoints: req.body.waypoints, 
      added_by_admin_id: req.body.added_by_admin_id,
      assigned: req.body.assigned || false // Default value for assigned
    };
  
    const schema = {
      name: { type: "string", empty: false, messages: { required: "Route Name is required" } },
      waypoints: { type: "string", empty: false, messages: { required: "Waypoints are required" } },
      added_by_admin_id: { type: "number", empty: false, messages: { required: "Added by Admin ID is required" } },
      assigned: { type: "boolean" } // Validate assigned field
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
  
 // Controller function to update a route
async function updateRoute(req, res) {
    const routeId = req.params.routeId;
    let updateRouteData = {
      name: req.body.name,
      waypoints: req.body.waypoints, 
      added_by_admin_id: req.body.added_by_admin_id,
      assigned: req.body.assigned || false 
    };
  
    const schema = {
      name: { type: "string", empty: false, messages: { required: "Route Name is required" } },
      waypoints: { type: "string", empty: false, messages: { required: "Waypoints are required" } },
      added_by_admin_id: { type: "number", empty: false, messages: { required: "Added by Admin ID is required" } },
      assigned: { type: "boolean" } 
    };
  
    const validatorInstance = new validator();
    const validationResponse = validatorInstance.validate(updateRouteData, schema);
  
    if (validationResponse !== true) {
      return res.status(400).json({
          message: "Validation failed",
          error: validationResponse
      });
    }
  
    try {
      const existingRoute = await models.Route.findOne({ 
        where: { 
          name: updateRouteData.name,
          id: { [models.Sequelize.Op.not]: routeId } // Exclude the current route's ID
        } 
      });
      if (existingRoute) {
        return res.status(409).json({ message: 'Route name already exists' });
      }
  
      const route = await models.Route.findByPk(routeId);
      if (!route) {
        return res.status(404).json({
          message: "Route not found"
        });
      }
  
      // Exclude the 'assigned' field from updateRouteData
      delete updateRouteData.assigned;
  
      await route.update(updateRouteData);
  
      res.status(200).json({
        message: "Route updated successfully",
        route: route
      });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Something went wrong!"
      });
    }
  }

  // Function to update the assigned field of a route
async function updateRouteAssigned(routeId, assigned) {
    try {
      const route = await models.Route.findByPk(routeId);
      if (!route) {
        throw new Error("Route not found");
      }
  
      // Update the assigned field
      route.assigned = assigned;
      await route.save();
  
      return route; // Return the updated route object
    } catch (error) {
      throw new Error("Failed to update route assigned field: " + error.message);
    }
  }
  
// Controller for deleting a route
async function deleteRoute(req, res) {
  const routeId = req.params.routeId;

  try {
    const route = await models.Route.findByPk(routeId);
    if (!route) {
      return res.status(404).json({
        message: "Route not found"
      });
    }

    // Check if the route is currently assigned to any assignment
    const activeAssignment = await models.Assignment.findOne({
      where: {
        route_id: routeId,
        deletedAt: null  // Ensure the assignment isn't already deleted
      }
    });

    if (activeAssignment) {
      return res.status(400).json({
        message: "Cannot delete route because it is currently assigned to an assignment."
      });
    }

    // Check if there are any active clients assigned to the route
    const activeClient = await models.Client.findOne({
      where: {
        route_id: routeId,
        deletedAt: null  // Ensure the client isn't already deleted
      }
    });

    if (activeClient) {
      return res.status(400).json({
        message: "Cannot delete route because it is currently assigned to a client."
      });
    }

    // Soft delete the route
    await route.destroy();
    res.status(200).json({
      message: "Route deleted successfully"
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Something went wrong!"
    });
  }
}

// Controller for getting all the routes
async function getAllRoutes(req, res) {
    try {
        // Fetch all routes from the database, including necessary fields
        const routes = await models.Route.findAll({
            attributes: ['id', 'name', 'waypoints', 'assigned', 'added_by_admin_id'], // Include necessary fields
            raw: true // Get raw data instead of Sequelize instances
        });

        // If there are no routes found
        if (!routes || routes.length === 0) {
            return res.status(404).json({ message: "No routes found" });
        }

        // Return the fetched routes
        res.status(200).json(routes);
    } catch (error) {
        console.error("Error fetching routes:", error);
        res.status(500).json({ message: "Failed to fetch routes" });
    }
}


    //Controller for getting a route
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
  updateRouteAssigned: updateRouteAssigned,
  deleteRoute: deleteRoute,
  getAllRoutes: getAllRoutes,
  getRoute: getRoute
};
