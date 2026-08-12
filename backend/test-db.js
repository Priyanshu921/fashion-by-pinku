const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('fashion_db', 'postgres', 'password', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false,
});

async function run() {
  const queryInterface = sequelize.getQueryInterface();
  const table = await queryInterface.describeTable('Addresses');
  console.log(table);
  process.exit(0);
}
run();
