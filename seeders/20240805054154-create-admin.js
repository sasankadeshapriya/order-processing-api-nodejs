'use strict';
const bcryptjs = require('bcryptjs');

/** change admin email, yourPasswordHere, and name fields to your's. When you login OTP recive to that email */


module.exports = {
  up: async (queryInterface, Sequelize) => {
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash('yourPasswordHere', salt);

    return queryInterface.bulkInsert('Admins', [{
      name: 'AdminName',
      email: 'admin@example.com',
      password: hashedPassword
    }], {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Admins', { email: 'admin@example.com' }, {});
  }
};
