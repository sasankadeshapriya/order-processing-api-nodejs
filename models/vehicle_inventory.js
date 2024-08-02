'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Vehicle_inventory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Vehicle_inventory.belongsTo(models.Assignment, { foreignKey: 'assignment_id' });
      Vehicle_inventory.belongsTo(models.Product, { foreignKey: 'product_id' });
      Vehicle_inventory.belongsTo(models.Batch, { foreignKey: 'sku', targetKey: 'sku' });
      Vehicle_inventory.belongsTo(models.Admin, { foreignKey: 'added_by_admin_id' });
    }
  }
  Vehicle_inventory.init({
    assignment_id: DataTypes.INTEGER,
    product_id: DataTypes.INTEGER,
    sku: DataTypes.STRING,
    quantity: DataTypes.DECIMAL(10, 2),
    added_by_admin_id: DataTypes.INTEGER,
    intialqty: DataTypes.DECIMAL(10, 2),
    looked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    deletedAt: DataTypes.DATE,
  }, {
    sequelize,
    modelName: 'Vehicle_inventory',
    paranoid: true
  });
  return Vehicle_inventory;
};