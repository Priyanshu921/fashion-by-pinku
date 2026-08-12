const { Sequelize } = require('sequelize');
const config = require('../src/db/config.json').development;

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: config.dialect
});

async function clean() {
  try {
    await sequelize.query('TRUNCATE TABLE "OrderItems", "Reviews", "Products" CASCADE;');
    console.log('SUCCESS: All mock products, reviews, and order items have been completely purged from the database.');
  } catch (err) {
    console.error('Error cleaning database:', err);
  } finally {
    await sequelize.close();
  }
}

clean();
