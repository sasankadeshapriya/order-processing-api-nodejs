'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Assignment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Assignment.belongsTo(models.Employee, { foreignKey: 'employee_id' });
      Assignment.belongsTo(models.Vehicle, { foreignKey: 'vehicle_id' });
      Assignment.belongsTo(models.Route, { foreignKey: 'route_id' });
      Assignment.belongsTo(models.Admin, { foreignKey: 'added_by_admin_id' });
      Assignment.hasMany(models.Vehicle_inventory, { foreignKey: 'assignment_id' });
    }
  }
  Assignment.init({
    employee_id: DataTypes.INTEGER,
    assign_date: DataTypes.DATE,
    vehicle_id: DataTypes.INTEGER,
    route_id: DataTypes.INTEGER,
    added_by_admin_id: DataTypes.INTEGER,
    deletedAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Assignment',
    paranoid: true
  });
  return Assignment;
};