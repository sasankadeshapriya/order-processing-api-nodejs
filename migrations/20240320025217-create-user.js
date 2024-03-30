'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
<<<<<<< Updated upstream:migrations/20240320025217-create-user.js
      email: {
        type: Sequelize.STRING
=======
      product_code: {
        type: Sequelize.STRING,
        unique: true
>>>>>>> Stashed changes:migrations/20240328083812-create-product.js
      },
      password: {
        type: Sequelize.STRING
      },
      otp: {
        type: Sequelize.INTEGER,
        allowNull:true
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
    await queryInterface.dropTable('Users');
  }
};