'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Payments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      reference_number: {
        type: Sequelize.STRING
      },
      amount: {
        type: Sequelize.DECIMAL(10,2)
      },
      payment_option: {
        type: Sequelize.ENUM('credit', 'cash', 'cheque', 'cash-half')
      },
      state: {
        type: Sequelize.ENUM('verified', 'not-verified', 'rejected')
      },
      notes: {
        type: Sequelize.STRING
      },
      added_by_employee_id: {
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
    await queryInterface.dropTable('Payments');
  }
};