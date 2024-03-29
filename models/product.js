'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Product.belongsTo(models.Admin, { foreignKey: 'added_by_admin_id' });
      Product.hasMany(models.Batch, { foreignKey: 'product_id' });
    }
  }
  Product.init({
    name: DataTypes.STRING,
    product_code: DataTypes.STRING,
    measurement_unit: DataTypes.ENUM('pcs', 'kg', 'lb', 'g'),
    description: DataTypes.TEXT,
    product_image: DataTypes.STRING,
    added_by_admin_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Product',
  });
  return Product;
};