'use strict';
const bcrypt = require('bcrypt');
require('dotenv').config();

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const adminEmail = process.env.ADMIN_EMAIL || 'pinku@fashionbypinku.com';
    const password = process.env.ADMIN_PASSWORD || 'Pinku@Fashion2026!';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Check if the admin user already exists
    const [existingAdmin] = await queryInterface.sequelize.query(
      `SELECT id FROM "Users" WHERE email = '${adminEmail}' LIMIT 1;`
    );

    if (existingAdmin && existingAdmin.length === 0) {
      await queryInterface.bulkInsert('Users', [{
        email: adminEmail,
        password: hashedPassword,
        name: 'Pinku Admin',
        phone: '',
        role: 'ADMIN',
        createdAt: new Date(),
        updatedAt: new Date()
      }], {});
    }
  },

  down: async (queryInterface, Sequelize) => {
    const adminEmail = process.env.ADMIN_EMAIL || 'pinku@fashionbypinku.com';
    await queryInterface.bulkDelete('Users', { email: adminEmail }, {});
  }
};
