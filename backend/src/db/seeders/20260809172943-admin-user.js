'use strict';
const bcrypt = require('bcrypt');
require('dotenv').config();

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const password = process.env.ADMIN_PASSWORD;
    const hashedPassword = await bcrypt.hash(password, 10);
    await queryInterface.bulkInsert('Users', [{
      email: process.env.ADMIN_EMAIL,
      password: hashedPassword,
      name: 'Pinku Admin',
      phone: '',
      role: 'ADMIN',
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', { email: process.env.ADMIN_EMAIL }, {});
  }
};
