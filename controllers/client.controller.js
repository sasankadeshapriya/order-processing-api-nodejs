const models = require('../models');
const validator = require('fastest-validator');

const v = new validator();

// Define schema for client data validation
const clientSchema = {
    name: { type: "string", min: 2, max: 50 },
    organization_name: { type: "string", optional: false },
    latitude: { type: "number", optional: true },
    longitude: { type: "number", optional: true },
    phone_no: { type: "string", optional: false, pattern: /^\+?\d{9,13}$/},
    status: { type: "enum", values: ['verified', 'not verified'], optional: true },
    discount: { type: "number", optional: false },
    credit_limit: { type: "number", optional: false },
    credit_period: { type: "number", optional: false },
    route_id: { type: "number", optional: false },
    added_by_employee_id: { type: "number", optional: false }
};

// Create a new client
async function createClient(req, res) {
    try {
        // Check if the phone number already exists
        const existingClientByPhone = await models.Client.findOne({ where: { phone_no: req.body.phone_no } });
        if (existingClientByPhone) {
            return res.status(409).json({ message: "Phone number already exists" });
        }

        // Check if the route_id already exists
        const existingClientByRoute = await models.Client.findOne({ where: { route_id: req.body.route_id } });
        if (existingClientByRoute) {
            // Check if a client with the same name and organization already exists for this route_id
            const existingClientByNameAndOrg = await models.Client.findOne({
                where: {
                    route_id: req.body.route_id,
                    name: req.body.name,
                    organization_name: req.body.organization_name
                }
            });
            if (existingClientByNameAndOrg) {
                return res.status(409).json({ message: "Client with the same name and organization name already exists for this route" });
            }
        }

        const validationResponse = v.validate(req.body, clientSchema);
        if (validationResponse !== true) {
            return res.status(400).json({ message: "Validation failed", errors: validationResponse });
        }

        const newClient = await models.Client.create(req.body);
        res.status(201).json({ client: newClient });
    } catch (error) {
        console.error("Error creating client:", error);
        res.status(500).json({ message: "Failed to create client" });
    }
}

// Update an existing client
async function updateClient(req, res) {
    try {
        const clientId = req.params.clientId;
        const client = await models.Client.findByPk(clientId);
        if (!client) {
            return res.status(404).json({ message: "Client not found" });
        }

        // Check if the updated phone number already exists
        if (req.body.phone_no !== client.phone_no) {
            const existingClientByPhone = await models.Client.findOne({ where: { phone_no: req.body.phone_no } });
            if (existingClientByPhone) {
                return res.status(409).json({ message: "Phone number already exists" });
            }
        }

        // Check if the updated route_id already exists
        if (req.body.route_id !== client.route_id) {
            // Check if a client with the same name and organization already exists for the new route_id
            const existingClientByNameAndOrg = await models.Client.findOne({
                where: {
                    route_id: req.body.route_id,
                    name: req.body.name,
                    organization_name: req.body.organization_name
                }
            });
            if (existingClientByNameAndOrg) {
                return res.status(409).json({ message: "Client with the same name and organization name already exists for the new route" });
            }
        }

        const validationResponse = v.validate(req.body, clientSchema);
        if (validationResponse !== true) {
            return res.status(400).json({ message: "Validation failed", errors: validationResponse });
        }

        await client.update(req.body);
        res.status(200).json({ message: "Client updated successfully", client });
    } catch (error) {
        console.error("Error updating client:", error);
        res.status(500).json({ message: "Failed to update client", error: error.message });
    }
}


// Delete an existing client
async function deleteClient(req, res) {
    try {
        const clientId = req.params.clientId;
        const client = await models.Client.findByPk(clientId);
        if (!client) {
            return res.status(404).json({ message: "Client not found" });
        }

        //client softdelete
        await client.destroy();
        res.status(200).json({ message: "Client deleted successfully" });
    } catch (error) {
        console.error("Error deleting client:", error);
        res.status(500).json({ message: "Failed to delete client" });
    }
}

// Get all clients
async function getAllClients(req, res) {
    try {
        const clients = await models.Client.findAll();
        res.status(200).json(clients);
    } catch (error) {
        console.error("Error fetching clients:", error);
        res.status(500).json({ message: "Failed to fetch clients" });
    }
}

// Get a specific client by ID
async function getClientById(req, res) {
    try {
        const clientId = req.params.clientId;
        const client = await models.Client.findByPk(clientId);
        if (!client) {
            return res.status(404).json({ message: "Client not found" });
        }
        res.status(200).json(client);
    } catch (error) {
        console.error("Error fetching client by ID:", error);
        res.status(500).json({ message: "Failed to fetch client by ID" });
    }
}

// get client locations by route id
async function getClientsByRouteId(req, res) {
    try {
        const routeId = req.params.routeId;  // Get the route ID from request parameters
        if (!routeId) {
            return res.status(400).json({ message: "Route ID is required" });
        }

        const clients = await models.Client.findAll({
            attributes: ['latitude', 'longitude', 'organization_name'],  // Select latitude, longitude, and organization name
            where: {
                route_id: routeId  // Filter clients by the provided route ID
            }
        });

        if (clients.length === 0) {
            return res.status(404).json({ message: "No clients found for this route" });
        }

        res.status(200).json(clients);
    } catch (error) {
        console.error("Error fetching client locations by route ID:", error);
        res.status(500).json({ message: "Failed to fetch client locations by route ID" });
    }
}


// Update client status
async function updateClientStatus(req, res) {
    try {
        const clientId = req.params.clientId;
        const { status } = req.body;

        // Validate status
        if (!['verified', 'not verified'].includes(status)) {
            return res.status(400).json({ message: "Invalid status value" });
        }

        const client = await models.Client.findByPk(clientId);
        if (!client) {
            return res.status(404).json({ message: "Client not found" });
        }

        client.status = status;
        await client.save();

        res.status(200).json({ message: "Client status updated successfully", client });
    } catch (error) {
        console.error("Error updating client status:", error);
        res.status(500).json({ message: "Failed to update client status" });
    }
}

module.exports = {
    createClient:createClient,
    updateClient:updateClient,
    deleteClient:deleteClient,
    getAllClients:getAllClients,
    getClientById:getClientById,
    getClientsByRouteId:getClientsByRouteId,
    updateClientStatus:updateClientStatus
}