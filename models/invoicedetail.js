'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class InvoiceDetail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      InvoiceDetail.belongsTo(models.Invoice, { foreignKey: 'reference_number', targetKey: 'reference_number' });
    }
  }
  InvoiceDetail.init({
    reference_number: DataTypes.STRING,
    product_id: DataTypes.INTEGER,
    batch_id: DataTypes.INTEGER,
    quantity: DataTypes.DECIMAL(10 , 2),
    sum: DataTypes.DECIMAL(10 , 2)
  }, {
    sequelize,
    modelName: 'InvoiceDetail',
  });
  return InvoiceDetail;
};