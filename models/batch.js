'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Batch extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Batch.belongsTo(models.Product, { foreignKey: 'product_id' });
      Batch.belongsTo(models.Admin, { foreignKey: 'added_by_admin_id' });
    }
  }
  Batch.init({
    sku: DataTypes.STRING,
    product_id: DataTypes.INTEGER,
    date: DataTypes.DATE,
    buy_price: DataTypes.DECIMAL(10, 2),
    cash_price: DataTypes.DECIMAL(10, 2),
    check_price: DataTypes.DECIMAL(10, 2),
    credit_price: DataTypes.DECIMAL(10, 2),
    quantity: DataTypes.DECIMAL(10, 2),
    expire_date: DataTypes.DATE,
    added_by_admin_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Batch',
  });
  return Batch;
};