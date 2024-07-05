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
      Payment.belongsTo(models.Invoice, { foreignKey: 'reference_number', targetKey: 'reference_number' });
    }
  }
  Payment.init({
    reference_number: DataTypes.STRING,
    amount: DataTypes.DECIMAL(10,2),
    payment_option: DataTypes.ENUM('credit', 'cash', 'cheque', 'cash-half'),
    state: DataTypes.ENUM('verified', 'not-verified', 'rejected'),
    notes: DataTypes.STRING,
    added_by_employee_id: DataTypes.INTEGER,
    deletedAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Payment',
    paranoid: true
  });
  return Payment;
};