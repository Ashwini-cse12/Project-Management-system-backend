require("dotenv").config();

// Read by sequelize-cli for `sequelize-cli db:migrate`, `db:seed`, etc.
// Kept in plain JS (not JSON) so it can pull from process.env directly.
const databaseConfig = {
  username: process.env.MYSQLUSER || process.env.DB_USER,
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD,
  database: process.env.MYSQLDATABASE || process.env.DB_NAME,
  host: process.env.MYSQLHOST || process.env.DB_HOST,
  port: Number(process.env.MYSQLPORT || process.env.DB_PORT || 3306),
  dialect: "mysql",
  logging: false,
};

module.exports = {
  development: {
    ...databaseConfig,
  },
  test: {
    ...databaseConfig,
    database:
      process.env.DB_NAME_TEST ||
      process.env.MYSQLDATABASE_TEST ||
      `${databaseConfig.database}_test`,
  },
  production: {
    ...databaseConfig,
  },
};
