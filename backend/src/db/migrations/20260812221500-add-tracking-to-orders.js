'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Orders', 'trackingNumber', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Orders', 'courier', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Orders', 'trackingNumber');
    await queryInterface.removeColumn('Orders', 'courier');
  }
};
