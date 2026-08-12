'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Adding addressId column
    await queryInterface.addColumn('Orders', 'addressId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Addresses', // Assuming table name is Addresses
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    }).catch(err => console.log('Column addressId might already exist', err.message));

    // Removing receipt column
    await queryInterface.removeColumn('Orders', 'receipt')
      .catch(err => console.log('Column receipt might not exist', err.message));
  },

  down: async (queryInterface, Sequelize) => {
    // Reverting changes
    await queryInterface.removeColumn('Orders', 'addressId')
      .catch(err => console.log('Column addressId might not exist', err.message));
    
    await queryInterface.addColumn('Orders', 'receipt', {
      type: Sequelize.STRING,
      allowNull: true
    }).catch(err => console.log('Column receipt might already exist', err.message));
  }
};
