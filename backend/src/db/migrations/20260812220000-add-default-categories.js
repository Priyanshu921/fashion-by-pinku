'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if categories already exist
    const [existingCategories] = await queryInterface.sequelize.query(
      `SELECT id FROM "Categories" LIMIT 1;`
    );

    if (existingCategories && existingCategories.length === 0) {
      const now = new Date();
      await queryInterface.bulkInsert('Categories', [
        {
          name: 'Dresses',
          slug: 'dresses',
          image: 'https://images.unsplash.com/photo-1515347619362-67fd13c66289?auto=format&fit=crop&q=80',
          createdAt: now,
          updatedAt: now
        },
        {
          name: 'Tops',
          slug: 'tops',
          image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80',
          createdAt: now,
          updatedAt: now
        },
        {
          name: 'Bottoms',
          slug: 'bottoms',
          image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80',
          createdAt: now,
          updatedAt: now
        },
        {
          name: 'Accessories',
          slug: 'accessories',
          image: 'https://images.unsplash.com/photo-1509319117193-57bab727e09d?auto=format&fit=crop&q=80',
          createdAt: now,
          updatedAt: now
        },
        {
          name: 'Footwear',
          slug: 'footwear',
          image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80',
          createdAt: now,
          updatedAt: now
        }
      ], {});
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Categories', {
      slug: ['dresses', 'tops', 'bottoms', 'accessories', 'footwear']
    }, {});
  }
};
