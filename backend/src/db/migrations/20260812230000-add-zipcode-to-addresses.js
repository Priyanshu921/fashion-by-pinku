'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.addColumn('Addresses', 'zipCode', {
        type: Sequelize.STRING,
        allowNull: true, // Allow null temporarily to prevent issues with existing rows, if any
      });
    } catch (err) {
      console.log('zipCode might already exist or error occurred:', err.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn('Addresses', 'zipCode');
    } catch (err) {
      console.log('Error removing zipCode:', err.message);
    }
  }
};
