'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Batches', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      sku: {
        type: Sequelize.STRING,
        allowNull: false
      },
      product_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      date: {
        type: Sequelize.DATEONLY
      },
      buy_price: {
        type: Sequelize.DECIMAL(10 , 2),
        allowNull: false
      },
      cash_price: {
        type: Sequelize.DECIMAL(10 , 2),
        allowNull: false
      },
      check_price: {
        type: Sequelize.DECIMAL(10 , 2),
        allowNull: false
      },
      credit_price: {
        type: Sequelize.DECIMAL(10 , 2),
        allowNull: false
      },
      quantity: {
        type: Sequelize.DECIMAL(10 , 2),
        allowNull: false
      },
      expire_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      added_by_admin_id: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Batches');
  }
};