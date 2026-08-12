'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Products', 'imageSrc', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    await queryInterface.changeColumn('Categories', 'image', {
      type: Sequelize.TEXT,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Products', 'imageSrc', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.changeColumn('Categories', 'image', {
      type: Sequelize.STRING,
      allowNull: true
    });
  }
};
