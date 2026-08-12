const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
});

async function run() {
  try {
    await sequelize.authenticate();
    console.log('Connected to DB');
    await sequelize.query('ALTER TABLE "Orders" ADD COLUMN "trackingNumber" VARCHAR(255);').catch(e => console.log(e.message));
    await sequelize.query('ALTER TABLE "Orders" ADD COLUMN "courier" VARCHAR(255);').catch(e => console.log(e.message));
    console.log('Columns added successfully');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

run();
