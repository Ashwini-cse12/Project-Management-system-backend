require("dotenv").config();

const { Sequelize } = require("sequelize");
const logger = require("./utils/logger");

// Supports the existing local DB_* variables and the MYSQL* variables commonly
// supplied by managed MySQL deployment providers.
const database = process.env.MYSQLDATABASE || process.env.DB_NAME;
const username = process.env.MYSQLUSER || process.env.DB_USER;
const password = process.env.MYSQLPASSWORD || process.env.DB_PASSWORD;
const host = process.env.MYSQLHOST || process.env.DB_HOST;
const port = Number(process.env.MYSQLPORT || process.env.DB_PORT || 3306);

if (!database || !username || !host) {
  throw new Error(
    "Database configuration is incomplete. Set MYSQLHOST, MYSQLUSER, MYSQLPASSWORD, and MYSQLDATABASE (or the DB_* equivalents)."
  );
}

const sequelize = new Sequelize(database, username, password, {
  host,
  port,
  dialect: "mysql",
  logging: false,
});

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info("MySQL database connected successfully (Sequelize)");
  } catch (error) {
    logger.error(`MySQL connection failed: ${error.message}`);
    throw error;
  }
};

module.exports = { sequelize, Sequelize, testConnection };
