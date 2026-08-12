const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('postgres://contextra:contextrapassword@localhost:5432/fashion_db', {
  dialect: 'postgres',
  logging: false,
});

async function run() {
  try {
    await sequelize.authenticate();
    const query = `
      UPDATE "Products"
      SET "imageSrc" = 'https://via.placeholder.com/800x800?text=No+Image'
      WHERE "imageSrc" LIKE '%unsplash.com%';
    `;
    const [results, metadata] = await sequelize.query(query);
    console.log(`Updated ${metadata.rowCount} products with unsplash URLs.`);
    process.exit(0);
  } catch (error) {
    console.error('Error updating DB:', error);
    process.exit(1);
  }
}

run();
