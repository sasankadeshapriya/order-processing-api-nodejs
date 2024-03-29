'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Vehicle extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Vehicle.belongsTo(models.Admin, { foreignKey: 'added_by_admin_id' });
      Vehicle.hasMany(models.Assignment, { foreignKey: 'vehicle_id' });  
    }
  }
  Vehicle.init({
    vehicle_no: DataTypes.STRING,
    name: DataTypes.STRING,
    type: DataTypes.STRING,
    added_by_admin_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Vehicle',
  });
  return Vehicle;
};