'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Commission extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Commission.belongsTo(models.Employee, { foreignKey: 'emp_id' });
    }
  }
  Commission.init({
    emp_id: DataTypes.INTEGER,
    date: DataTypes.DATE,
    commission: DataTypes.DECIMAL(10, 2)
  }, {
    sequelize,
    modelName: 'Commission',
  });
  return Commission;
};