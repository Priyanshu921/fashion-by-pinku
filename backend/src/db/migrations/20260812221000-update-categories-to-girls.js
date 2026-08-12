'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Delete 'women' and 'men' categories
    await queryInterface.bulkDelete('Categories', {
      slug: ['women', 'men']
    }, {});

    const now = new Date();
    
    // Insert new categories (Accessories and Footwear are already there from the previous migration)
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
      }
    ], { ignoreDuplicates: true }).catch(err => console.log('Categories might already exist'));
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Categories', {
      slug: ['dresses', 'tops', 'bottoms']
    }, {});

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
      }
    ], {});
  }
};
