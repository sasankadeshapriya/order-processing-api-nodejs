'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Clients', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      organization_name: {
        type: Sequelize.STRING
      },
      latitude: {
        type: Sequelize.DECIMAL
      },
      longitude: {
        type: Sequelize.DECIMAL
      },
      phone_no: {
        type: Sequelize.STRING
      },
      outstanding_balance: {
        type: Sequelize.DECIMAL
      },
      status: {
        type: Sequelize.ENUM('verified', 'not verified'),
        defaultValue: 'not verified'
      },
      discount: {
        type: Sequelize.DECIMAL
      },
      credit_limit: {
        type: Sequelize.DECIMAL
      },
      credit_period: {
        type: Sequelize.INTEGER
      },
      route_id: {
        type: Sequelize.INTEGER
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
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Clients');
  }
};