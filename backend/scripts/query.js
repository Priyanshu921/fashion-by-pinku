const { Sequelize } = require('sequelize');
const config = require('../src/db/config.json').development;

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: config.dialect
});

async function run() {
  try {
    const [results, metadata] = await sequelize.query('SELECT id, title, left("imageSrc", 150) as "imageSrc" FROM "Products";');
    console.log(results);
  } catch (err) {
    console.error(err);
  } finally {
    await sequelize.close();
  }
}
run();
