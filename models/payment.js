'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Payment.belongsTo(models.Invoice, { foreignKey: 'invoice_id' });
      Payment.belongsTo(models.Employee, { foreignKey: 'added_by_employee_id' });
    }
  }
  Payment.init({
    invoice_id: DataTypes.INTEGER,
    amount: DataTypes.DECIMAL(10, 2),
    outstanding_balance: DataTypes.DECIMAL(10, 2),
    payment_date: DataTypes.DATE,
    payment_method: DataTypes.STRING,
    transaction_id: DataTypes.STRING,
    notes: DataTypes.TEXT,
    added_by_employee_id: DataTypes.INTEGER,
    created_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Payment',
  });
  return Payment;
};