'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Employees', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      password: {
        type: Sequelize.STRING
      },
      otp: {
        type: Sequelize.INTEGER
      },
      nic: {
        type: Sequelize.STRING
      },
      phone_no: {
        type: Sequelize.STRING
      },
      commission_rate: {
        type: Sequelize.DECIMAL(5, 2)
      },
      added_by_admin_id: {
        type: Sequelize.INTEGER
      },
      current_location: {
        type: Sequelize.STRING 
      },
      assigned: {
        type: Sequelize.BOOLEAN, 
        defaultValue: false 
      },
      profile_picture: { 
        type: Sequelize.STRING 
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
    await queryInterface.dropTable('Employees');
  }
};
