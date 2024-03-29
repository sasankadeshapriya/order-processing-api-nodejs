// test.controller.js
const db = require('../models');

const TestController = {
  async getEmployeeAdminDetails(req, res) {
    try {
      const { employeeId } = req.params;

      const employee = await db.Employee.findByPk(employeeId, {
        include: {
          model: db.Admin,
          attributes: ['id', 'name', 'email'] // Include only necessary admin attributes
        }
      });

      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }

      return res.json(employee);
    } catch (error) {
      console.error('Error getting employee admin details:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = TestController;
