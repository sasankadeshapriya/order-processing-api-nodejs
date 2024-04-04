const models = require('../models');

async function addCommission(req, res) {
    const { emp_id, date, commission } = req.body;

    try {
        // Check if a commission record already exists for the given emp_id and date
        let existingCommission = await models.Commission.findOne({
            where: { emp_id, date }
        });

        if (existingCommission) {
            // If a record already exists, update the commission amount
            existingCommission.commission = commission;
            await existingCommission.save();
            return res.status(200).json({
                message: "Commission updated successfully",
                commission: existingCommission
            });
        } else {
            // If no record exists, create a new commission record
            const newCommission = await models.Commission.create({ emp_id, date, commission });
            return res.status(201).json({
                message: "Commission added successfully",
                commission: newCommission
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Something went wrong!"
        });
    }
}

module.exports = {
    addCommission
};
