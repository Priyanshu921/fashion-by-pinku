const { Sequelize } = require('sequelize');
const config = require('../src/db/config.json').development;

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: config.dialect
});

async function run() {
  try {
    const [results] = await sequelize.query('SELECT * FROM "Products" ORDER BY id DESC LIMIT 5;');
    console.log('Recent 5 products in DB:', results);
  } catch (err) {
    console.error(err);
  } finally {
    await sequelize.close();
  }
}
run();
