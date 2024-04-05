const models = require('../models');
const moment = require('moment'); // Import library for date formatting
const Validator = require('fastest-validator');

async function addOrUpdateCommission(req, res) {
    // Validator schema for request body validation
    const schema = {
        emp_id: { type: "number", positive: true },
        date: { type: "string", format: "date-time" }, // Date format validation
        commission: { type: "number", positive: true } // Commission positive number validation
    };

    // Custom error messages for validation errors
    const validationMessages = {
        emp_id: "Employee ID must be a positive number",
        date: "Date must be in a valid date-time format",
        commission: "Commission must be a positive number"
    };

    // Create a validator instance
    const v = new Validator();

    try {
        
        const { emp_id, date, commission } = req.body;

        const validationResult = v.validate({ emp_id, date, commission }, schema);
        if (validationResult !== true) {
            const errors = validationResult.map(error => ({ message: validationMessages[error.field] }));
            return res.status(400).json({ message: "Validation failed", errors });
        }

        // Format the date to match the database format ('YYYY-MM-DD HH:mm:ss')
        const formattedDate = moment(date).format('YYYY-MM-DD HH:mm:ss');

        // Round the commission value to 2 decimal places
        const roundedCommission = parseFloat(commission.toFixed(2));

        // Check if a record with the given emp_id and date already exists
        let existingCommission = await models.Commission.findOne({
            where: { emp_id, date: formattedDate }
        });

        if (existingCommission) {
            console.log("Record found for emp_id", emp_id, "and date", formattedDate);
            // If a record exists, update the commission amount
            existingCommission.commission = roundedCommission;
            await existingCommission.save();
            return res.status(200).json({ message: "Commission updated successfully", commission: existingCommission });
        } else {
            console.log("No record found for emp_id", emp_id, "and date", formattedDate);
            // If no record exists, create a new one
            const newCommission = await models.Commission.create({
                emp_id,
                date: formattedDate,
                commission: roundedCommission
            });
            return res.status(201).json({ message: "Commission added successfully", commission: newCommission });
        }
    } catch (error) {
        console.error("Failed to add/update commission: ", error);
        return res.status(500).json({ message: "Failed to add/update commission" });
    }
}

module.exports = {
    addOrUpdateCommission: addOrUpdateCommission
}