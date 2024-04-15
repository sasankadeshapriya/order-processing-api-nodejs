'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Invoices', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      reference_number: {
        type: Sequelize.STRING
      },
      client_id: {
        type: Sequelize.INTEGER
      },
      employee_id: {
        type: Sequelize.INTEGER
      },
      total_amount: {
        type: Sequelize.DECIMAL(10, 2)
      },
      paid_amount: {
        type: Sequelize.DECIMAL(10, 2)
      },
      balance: {
        type: Sequelize.DECIMAL(10, 2)
      },
      discount: {
        type: Sequelize.DECIMAL(10, 2)
      },
      credit_period_end_date: {
        type: Sequelize.DATE
      },
      payment_option: {
        type: Sequelize.ENUM('credit', 'cash', 'cheque', 'cash-half')
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Invoices');
  }
};