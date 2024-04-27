const { Assignment, Employee, Vehicle_inventory, Product, Batch } = require('../models');
const { Sequelize } = require('sequelize');

async function fetchData(req, res) {
    const { employee_id, assign_date } = req.params;

    try {
        const assignments = await Assignment.findAll({
            where: {
                employee_id: employee_id,
                assign_date: Sequelize.where(Sequelize.fn('date', Sequelize.col('assign_date')), '=', assign_date)
            },
            include: [{
                model: Vehicle_inventory,
                attributes: ['id', 'assignment_id', 'product_id', 'sku', 'quantity'],  // Specify only needed attributes
                include: [{
                    model: Product,
                    attributes: ['id', 'name', 'product_code', 'measurement_unit', 'description', 'product_image'],
                    include: [{
                        model: Batch,
                        as: 'Batches',
                        attributes: ['sku', 'cash_price', 'check_price', 'credit_price'],  // Exclude unnecessary attributes
                    }]
                }]
            }]
        });

        if (!assignments.length) {
            return res.status(404).json({ message: "No assignments found for the given criteria." });
        }

        const employee = await Employee.findOne({
            where: { id: employee_id },
            attributes: ['name']
        });

        if (!employee) {
            return res.status(404).json({ message: "Employee not found." });
        }

        const data = {
            employee_name: employee.name,
            vehicle_inventory: assignments.map(assignment => 
                assignment.Vehicle_inventories.map(inventory => ({
                    id: inventory.id,
                    assignment_id: inventory.assignment_id,
                    product_id: inventory.product_id,
                    sku: inventory.sku,
                    quantity: inventory.quantity,
                    Product: {
                        ...inventory.Product.toJSON(),
                        Batches: inventory.Product.Batches.filter(batch => batch.sku === inventory.sku)
                    }
                }))
            ).flat()
        };

        return res.status(200).json(data);
    } catch (error) {
        console.error("Error fetching data:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = { fetchData };
