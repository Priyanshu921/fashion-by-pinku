const { Sequelize } = require('sequelize');
const config = require('../src/db/config.json').development;

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: config.dialect
});

async function alterColumn() {
  try {
    await sequelize.query('ALTER TABLE "Products" ALTER COLUMN "imageSrc" TYPE TEXT;');
    console.log('SUCCESS: Products.imageSrc column successfully altered to TEXT (unlimited length).');
  } catch (err) {
    console.error('Error altering column:', err.message);
  } finally {
    await sequelize.close();
  }
}

alterColumn();
