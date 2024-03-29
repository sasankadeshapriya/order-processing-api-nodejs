'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Invoice extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Invoice.belongsTo(models.Client, { foreignKey: 'client_id' });
      Invoice.belongsTo(models.Employee, { foreignKey: 'employee_id' });
      Invoice.belongsTo(models.Product, { foreignKey: 'product_id' });
      Invoice.belongsTo(models.Batch, { foreignKey: 'batch_id' });
      Invoice.hasMany(models.Payment, { foreignKey: 'invoice_id' });
    }
  }
  Invoice.init({
    reference_number: DataTypes.STRING,
    client_id: DataTypes.INTEGER,
    employee_id: DataTypes.INTEGER,
    product_id: DataTypes.INTEGER,
    batch_id: DataTypes.INTEGER,
    quantity: DataTypes.DECIMAL(10, 2),
    payment_option: DataTypes.ENUM('credit', 'cash', 'cheque'),
    date: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Invoice',
  });
  return Invoice;
};