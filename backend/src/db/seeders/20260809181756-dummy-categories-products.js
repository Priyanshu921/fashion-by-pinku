'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const categories = [
      { name: 'Dresses', slug: 'dresses', image: '', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Tops & Blouses', slug: 'tops', image: '', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Co-ord Sets', slug: 'coords', image: '', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Accessories', slug: 'accessories', image: '', createdAt: new Date(), updatedAt: new Date() },
    ];

    await queryInterface.bulkInsert('Categories', categories, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Products', null, {});
    await queryInterface.bulkDelete('Categories', null, {});
  }
};
