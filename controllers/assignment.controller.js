const models = require('../models');
const validator = require('fastest-validator');

// Controller function to create a new assignment
async function createAssignment(req, res) {
    const assignDate = new Date(req.body.assign_date);
    const assignData = {
        employee_id: req.body.employee_id,
        assign_date: assignDate,
        vehicle_id: req.body.vehicle_id,
        route_id: req.body.route_id,
        added_by_admin_id: req.body.added_by_admin_id
    };

    // Define the validation schema
    const schema = {
        employee_id: { type: "number", integer: true, positive: true, empty: false, messages: { required: "Employee ID is required" } },
        assign_date: { type: "date", empty: false, messages: { required: "Date is required" } },
        vehicle_id: { type: "number", integer: true, positive: true, empty: false, messages: { required: "Vehicle ID is required" } },
        route_id: { type: "number", integer: true, positive: true, empty: false, messages: { required: "Route ID is required" } },
        added_by_admin_id: { type: "number", integer: true, positive: true, empty: false, messages: { required: "Admin ID is required" } }
    };

    // Instantiate the validator
    const validatorInstance = new validator();

    // Validate the assignment data
    const validationResponse = validatorInstance.validate(assignData, schema);

    // Check if validation failed
    if (validationResponse !== true) {
        return res.status(400).json({
            message: "Validation failed",
            errors: validationResponse
        });
    }

    try {
        // Check if this employee is already assigned on the same date
        const dailyEmployeeAssignmentCheck = await models.Assignment.findOne({
            where: {
                employee_id: assignData.employee_id,
                assign_date: assignData.assign_date
            }
        });

        if (dailyEmployeeAssignmentCheck) {
            return res.status(400).json({
                message: `This employee is already assigned to a task on ${assignDate.toISOString().split('T')[0]}.`,
            });
        }

        // Check if an assignment already exists for the same employee, vehicle, route, and date
        const existingAssignment = await models.Assignment.findOne({
            where: {
                employee_id: assignData.employee_id,
                assign_date: assignData.assign_date,
                vehicle_id: assignData.vehicle_id,
                route_id: assignData.route_id
            }
        });

        if (existingAssignment) {
            return res.status(400).json({
                message: `An assignment already exists for employee id: ${assignData.employee_id}, vehicle id:${assignData.vehicle_id}, route id: ${assignData.route_id}, and date ${assignData.assign_date}.`,
            });
        }

        // Check if another employee is assigned to the same route and vehicle on the same day
        const conflictingAssignment = await models.Assignment.findOne({
            where: {
                assign_date: assignData.assign_date,
                vehicle_id: assignData.vehicle_id,
                route_id: assignData.route_id,
                employee_id: { [models.Sequelize.Op.not]: assignData.employee_id }
            }
        });

        if (conflictingAssignment) {
            return res.status(400).json({
                message: `Another employee is already assigned to route id: ${assignData.route_id} and vehicle id: ${assignData.vehicle_id} on ${assignData.assign_date}.`,
            });
        }

        // Check if another vehicle is already assigned to the same route on the same day
        const conflictingVehicleAssignment = await models.Assignment.findOne({
            where: {
                assign_date: assignData.assign_date,
                route_id: assignData.route_id,
                vehicle_id: { [models.Sequelize.Op.not]: assignData.vehicle_id }
            }
        });

        if (conflictingVehicleAssignment) {
            return res.status(400).json({
                message: `Another vehicle is already assigned to route ${assignData.route_id} on ${assignData.assign_date}.`,
            });
        }

        // Check if the vehicle is already assigned to a specific day
        const conflictingSameVehicleAssignment = await models.Assignment.findOne({
            where: {
                assign_date: assignData.assign_date,
                vehicle_id: assignData.vehicle_id
            }
        });

        if (conflictingSameVehicleAssignment && conflictingSameVehicleAssignment.route_id !== assignData.route_id) {
            return res.status(400).json({
                message: `The vehicle is already assigned to a different route on ${assignData.assign_date}.`,
            });
        }

        // No existing conflicts, proceed with the assignment creation
        const newAssignment = await models.Assignment.create(assignData);

        return res.status(201).json({
            message: "Assignment created successfully",
            assignment: newAssignment
        });
    } catch (error) {
        console.error("Error creating assignment:", error);
        return res.status(500).json({
            message: "An error occurred while creating the assignment",
            error: error.message // Include error message in the response
        });
    }
}

// Controller function to update an assignment
async function updateAssignment(req, res) {
    const assignmentId = req.params.assignmentId;
    const assignDate = new Date(req.body.assign_date);
    const updatedAssignData = {
        employee_id: req.body.employee_id,
        assign_date: assignDate,
        vehicle_id: req.body.vehicle_id,
        route_id: req.body.route_id,
        added_by_admin_id: req.body.added_by_admin_id
    };

    // Define the validation schema for the updated data
    const schema = {
        employee_id: { type: "number", integer: true, positive: true, empty: false, messages: { required: "Employee ID is required" } },
        assign_date: { type: "date", empty: false, messages: { required: "Date is required" } },
        vehicle_id: { type: "number", integer: true, positive: true, empty: false, messages: { required: "Vehicle ID is required" } },
        route_id: { type: "number", integer: true, positive: true, empty: false, messages: { required: "Route ID is required" } },
        added_by_admin_id: { type: "number", integer: true, positive: true, empty: false, messages: { required: "Admin ID is required" } }
    };

    // Instantiate the validator
    const validatorInstance = new validator();

    // Validate the updated assignment data
    const validationResponse = validatorInstance.validate(updatedAssignData, schema);

    // Check if validation failed
    if (validationResponse !== true) {
        return res.status(400).json({
            message: "Validation failed",
            errors: validationResponse
        });
    }

    try {
        // Check if the assignment exists
        const assignment = await models.Assignment.findByPk(assignmentId);
        if (!assignment) {
            return res.status(404).json({
                message: "Assignment not found"
            });
        }

        // Check if the updated employee is already assigned on the same day
        const conflictingEmployeeAssignment = await models.Assignment.findOne({
            where: {
                assign_date: updatedAssignData.assign_date,
                employee_id: updatedAssignData.employee_id,
                id: { [models.Sequelize.Op.not]: assignmentId } // Exclude the current assignment being updated
            }
        });

        if (conflictingEmployeeAssignment) {
            return res.status(400).json({
                message: `Employee id: ${updatedAssignData.employee_id} is already assigned on ${updatedAssignData.assign_date}`,
            });
        }

        // Check if the updated vehicle is already assigned on the same day
        const conflictingVehicleAssignment = await models.Assignment.findOne({
            where: {
                assign_date: updatedAssignData.assign_date,
                vehicle_id: updatedAssignData.vehicle_id,
                id: { [models.Sequelize.Op.not]: assignmentId } // Exclude the current assignment being updated
            }
        });

        if (conflictingVehicleAssignment) {
            return res.status(400).json({
                message: `Vehicle id: ${updatedAssignData.vehicle_id} is already assigned on ${updatedAssignData.assign_date}`,
            });
        }

        // Check if the updated route is already assigned on the same day
        const conflictingRouteAssignment = await models.Assignment.findOne({
            where: {
                assign_date: updatedAssignData.assign_date,
                route_id: updatedAssignData.route_id,
                id: { [models.Sequelize.Op.not]: assignmentId } // Exclude the current assignment being updated
            }
        });

        if (conflictingRouteAssignment) {
            return res.status(400).json({
                message: `Route id:${updatedAssignData.route_id} is already assigned on ${updatedAssignData.assign_date}`,
            });
        }

        // Update the assignment
        await assignment.update(updatedAssignData);

        res.status(200).json({
            message: "Assignment updated successfully",
            assignment: assignment
        });
    } catch (error) {
        console.error("Error updating assignment:", error);
        return res.status(500).json({
            message: "An error occurred while updating the assignment",
            error: error.message 
        });
    }
}

//Controller for deleting a assignment
async function deleteAssignment(req,res){
    const assignmentId = req.params.assignmentId;
    try{
        const assignment = await models.Assignment.findByPk(assignmentId);
        if(!assignment){
            return res.status(404).json({
                message: "Assignment not found"
            });
        }
        await assignment.destroy();
        res.status(200).json({
            message:"Assignment deleted successfully"
        });
    }catch(error){
        console.log(error);
        res.status(500).json({
            message:"Something went wrong!"
        });
    }
}

    //Controller for getting all the assignments
    async function getAllAssignments(req,res){
        try{
            const assignments = await models.Assignment.findAll();
            res.status(200).json(assignments);
        }catch(error){
            console.log(error);
            res.status(500).json({
                message: "Something went wrong!"
            });
        }
}   

    //Controller for getting an assignment
    async function getAssignment(req,res){
        const assignmentId = req.params.assignmentId;
        try{
            const assignment = await models.Assignment.findByPk(assignmentId);
            if(!assignment){
                return res.status(404).json({
                    message: "Assignment not found"
                });
            }
            res.status(200).json(assignment);
        }catch(error){
            console.log(error);
            res.status(500).json({
                message:"Something went wrong!"
            });
        }
}

module.exports = {
    createAssignment: createAssignment, 
    updateAssignment: updateAssignment,
    deleteAssignment: deleteAssignment,
    getAllAssignments: getAllAssignments,
    getAssignment: getAssignment
}
