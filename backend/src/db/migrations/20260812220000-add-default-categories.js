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
          name: 'Women',
          slug: 'women',
          image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80',
          createdAt: now,
          updatedAt: now
        },
        {
          name: 'Men',
          slug: 'men',
          image: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&q=80',
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
      slug: ['women', 'men', 'accessories', 'footwear']
    }, {});
  }
};
