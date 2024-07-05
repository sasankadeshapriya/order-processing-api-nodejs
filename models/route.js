'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Route extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Route.belongsTo(models.Admin, { foreignKey: 'added_by_admin_id' });
      Route.hasMany(models.Client, { foreignKey: 'route_id' });
      Route.hasMany(models.Assignment, { foreignKey: 'route_id' });
    }
  }
  Route.init({
    name: DataTypes.STRING,
    waypoints: DataTypes.TEXT,
    added_by_admin_id: DataTypes.INTEGER,
    deletedAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Route',
    paranoid: true
  });
  return Route;
};