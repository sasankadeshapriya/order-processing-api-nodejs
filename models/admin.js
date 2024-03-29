'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Admin extends Model {
    static associate(models) {
      Admin.hasMany(models.Employee, { foreignKey: 'added_by_admin_id' });
      Admin.hasMany(models.Product, { foreignKey: 'added_by_admin_id' });
      Admin.hasMany(models.Vehicle, { foreignKey: 'added_by_admin_id' });
      Admin.hasMany(models.Route, { foreignKey: 'added_by_admin_id' });
      Admin.hasMany(models.Vehicle_inventory, { foreignKey: 'added_by_admin_id' });
      Admin.hasMany(models.Batch, { foreignKey: 'added_by_admin_id' });
      Admin.hasMany(models.Assignment, { foreignKey: 'added_by_admin_id' });
    }
  }
  Admin.init({
    name: DataTypes.STRING,
    password: DataTypes.STRING,
    email: DataTypes.STRING,
    otp: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Admin',
  });
  return Admin;
};