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
      Invoice.hasMany(models.Payment, { foreignKey: 'reference_number', sourceKey: 'reference_number' });
      Invoice.hasMany(models.InvoiceDetail, { foreignKey: 'reference_number', sourceKey: 'reference_number' });
    }
  }
  Invoice.init({
    reference_number: DataTypes.STRING,
    client_id: DataTypes.INTEGER,
    employee_id: DataTypes.INTEGER,
    total_amount: DataTypes.DECIMAL(10, 2),
    paid_amount: DataTypes.DECIMAL(10, 2),
    balance: DataTypes.DECIMAL(10, 2),
    discount: DataTypes.DECIMAL(10, 2),
    credit_period_end_date: DataTypes.DATE,
    payment_option: DataTypes.ENUM('credit', 'cash', 'cheque','cash-half')
  }, {
    sequelize,
    modelName: 'Invoice',
  });
  return Invoice;
};