const models = require('../models');
const moment = require('moment'); 
const Validator = require('fastest-validator');

const { Employee, Commission, Sequelize } = require('../models');
const { Op } = Sequelize;

async function addOrUpdateCommission(req, res) {
    
    const schema = {
        emp_id: { type: "number", positive: true },
        date: { type: "string", format: "date-time" }, 
        commission: { type: "number", positive: true }
    };

    const validationMessages = {
        emp_id: "Employee ID must be a positive number",
        date: "Date must be in a valid date-time format",
        commission: "Commission must be a positive number"
    };

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
            // Ensure existingCommission.commission is a number
            const existingCommissionValue = parseFloat(existingCommission.commission);
            // If a record exists, update the commission amount by adding the new value
            const updatedCommission = parseFloat((existingCommissionValue + roundedCommission).toFixed(2));
            existingCommission.commission = updatedCommission;
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


async function getAllCommissions(req, res) {
    try {
        let filterOptions = {};

        // Check if emp_id is provided in the query parameters
        if (req.query.emp_id) {
            // Add emp_id filter to the options
            filterOptions.emp_id = req.query.emp_id;
        }

        // Check if date range is provided in the query parameters
        if (req.query.start_date && req.query.end_date) {
            // Add date range filter to the options
            filterOptions.date = {
                [models.Sequelize.Op.between]: [req.query.start_date, req.query.end_date]
            };
        } else if (req.query.month) {
            // Calculate start and end dates for the given month
            const month = req.query.month;
            const year = req.query.year || moment().year(); // Use current year if year is not provided
            const startDate = moment(`${year}-${month}-01`).startOf('month').format('YYYY-MM-DD');
            const endDate = moment(startDate).endOf('month').format('YYYY-MM-DD');

            // Add date range filter to the options
            filterOptions.date = {
                [models.Sequelize.Op.between]: [startDate, endDate]
            };
        } else if (req.query.year) {
            // Calculate start and end dates for the given year
            const year = req.query.year;
            const startDate = moment(`${year}-01-01`).startOf('year').format('YYYY-MM-DD');
            const endDate = moment(startDate).endOf('year').format('YYYY-MM-DD');

            // Add date range filter to the options
            filterOptions.date = {
                [models.Sequelize.Op.between]: [startDate, endDate]
            };
        }

        // Fetch commission records based on the filter options
        const commissions = await models.Commission.findAll({
            where: filterOptions
        });

        // Return the list of commissions in the response
        return res.status(200).json({ commissions });
    } catch (error) {
        console.error("Failed to fetch commissions: ", error);
        return res.status(500).json({ message: "Failed to fetch commissions" });
    }
}

async function getCommissionsByEmpId(req, res) {
    try {
      const empId = req.params.empId;
      const commissions = await models.Commission.findAll({
        where: { emp_id: empId }
      });
      if (commissions.length === 0) {
        return res.status(404).json({ message: "No commissions found for employee ID " + empId });
      }
      return res.status(200).json({ commissions });
    } catch (error) {
      console.error("Failed to fetch commissions by emp ID: ", error);
      return res.status(500).json({ message: "Failed to fetch commissions by emp ID" });
    }
  }

  async function getCommissionReport(req, res) {
    try {
        let dateFilter = {};
        const { filter = 'month', start_date, end_date } = req.query;

        switch (filter) {
            case 'day':
                dateFilter = {
                    date: {
                        [Op.gte]: moment().startOf('day').toDate(),
                        [Op.lt]: moment().endOf('day').toDate()
                    }
                };
                break;
            case 'week':
                dateFilter = {
                    date: {
                        [Op.gte]: moment().startOf('week').toDate(),
                        [Op.lt]: moment().endOf('week').toDate()
                    }
                };
                break;
            case 'month':
                dateFilter = {
                    date: {
                        [Op.gte]: moment().startOf('month').toDate(),
                        [Op.lt]: moment().endOf('month').toDate()
                    }
                };
                break;
            case 'year':
                dateFilter = {
                    date: {
                        [Op.gte]: moment().startOf('year').toDate(),
                        [Op.lt]: moment().endOf('year').toDate()
                    }
                };
                break;
            case 'all':
                dateFilter = {};
                break;
            case 'custom':
                if (start_date && end_date) {
                    dateFilter = {
                        date: {
                            [Op.gte]: moment(start_date).startOf('day').toDate(),
                            [Op.lt]: moment(end_date).endOf('day').toDate()
                        }
                    };
                } else {
                    return res.status(400).json({ message: "Custom range requires start_date and end_date" });
                }
                break;
            default:
                dateFilter = {
                    date: {
                        [Op.gte]: moment().startOf('month').toDate(),
                        [Op.lt]: moment().endOf('month').toDate()
                    }
                };
                break;
        }

        const commissions = await Commission.findAll({
            where: {
                ...dateFilter
            },
            include: [{
                model: Employee,
                attributes: ['name', 'email'],
                paranoid: false
            }]
        });

        const totalCommission = commissions.reduce((sum, commission) => sum + parseFloat(commission.commission), 0);

        const employeeCommissions = commissions.reduce((acc, commission) => {
            const employeeId = commission.emp_id;
            if (!acc[employeeId]) {
                acc[employeeId] = {
                    name: commission.Employee.name,
                    email: commission.Employee.email,
                    total_commission: 0
                };
            }
            acc[employeeId].total_commission += parseFloat(commission.commission);
            return acc;
        }, {});

        const employeeList = Object.values(employeeCommissions).map(employee => ({
            name: employee.name,
            email: employee.email,
            total_commission: employee.total_commission.toFixed(2)
        }));

        const top10Employees = employeeList.sort((a, b) => b.total_commission - a.total_commission).slice(0, 10);

        return res.status(200).json({
            total_commission: totalCommission.toFixed(2),
            top10_employees: top10Employees,
            employee_list: employeeList
        });
    } catch (error) {
        console.error("Failed to fetch commission report: ", error);
        return res.status(500).json({ message: "Failed to fetch commission report" });
    }
}

module.exports = {
    addOrUpdateCommission: addOrUpdateCommission,
    getAllCommissions: getAllCommissions,
    getCommissionsByEmpId: getCommissionsByEmpId,
    getCommissionReport: getCommissionReport
}