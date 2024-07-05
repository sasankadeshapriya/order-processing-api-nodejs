'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Employee extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Employee.belongsTo(models.Admin, { foreignKey: 'added_by_admin_id' });
      Employee.hasMany(models.Client, { foreignKey: 'added_by_employee_id' });
      Employee.hasMany(models.Commission, { foreignKey: 'emp_id' });
      Employee.hasMany(models.Invoice, { foreignKey: 'employee_id' });
    }
  }
  Employee.init({
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    otp: DataTypes.INTEGER,
    nic: DataTypes.STRING,
    phone_no: DataTypes.STRING,
    commission_rate: DataTypes.DECIMAL(10, 2),
    added_by_admin_id: DataTypes.INTEGER,
    current_location: DataTypes.STRING,
    profile_picture: DataTypes.STRING,
    deletedAt: DataTypes.DATE
  }, 
  {
    sequelize,
    modelName: 'Employee',
    paranoid: true
  });
  return Employee;
};