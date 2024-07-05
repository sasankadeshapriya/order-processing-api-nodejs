'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Client extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Client.belongsTo(models.Employee, { foreignKey: 'added_by_employee_id' });
      Client.belongsTo(models.Route, { foreignKey: 'route_id' });
      Client.hasMany(models.Invoice, { foreignKey: 'client_id' });
    }
  }
  Client.init({
    name: DataTypes.STRING,
    organization_name: DataTypes.STRING,
    latitude: DataTypes.DECIMAL(10, 8),
    longitude: DataTypes.DECIMAL(11, 8),
    phone_no: DataTypes.STRING,
    status: {
      type: DataTypes.ENUM('verified', 'not verified'),
      defaultValue: 'not verified'
    },
    discount: DataTypes.DECIMAL(10, 2),
    credit_limit: DataTypes.DECIMAL(10, 2),
    credit_period: DataTypes.INTEGER,
    route_id: DataTypes.INTEGER,
    added_by_employee_id: DataTypes.INTEGER,
    deletedAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Client',
    paranoid: true
  });
  return Client;
};