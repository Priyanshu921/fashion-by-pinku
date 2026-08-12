'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn('Addresses', 'postalCode');
    } catch (err) {
      console.log('Error removing postalCode (maybe it does not exist):', err.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.addColumn('Addresses', 'postalCode', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    } catch (err) {
      console.log('Error adding postalCode:', err.message);
    }
  }
};
