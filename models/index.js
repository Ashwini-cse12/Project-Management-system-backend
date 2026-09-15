const fs = require("fs");
const path = require("path");
const { Sequelize, DataTypes } = require("sequelize");
require("dotenv").config();

const env = process.env.NODE_ENV || "development";
const config = require("../config/config.js")[env];
const logger = require("../utils/logger");

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  port: config.port,
  dialect: config.dialect,
  logging: config.logging,
});

const db = {};

// Auto-load every model file in this folder (except this index file)
fs.readdirSync(__dirname)
  .filter((file) => file !== "index.js" && file.endsWith(".js"))
  .forEach((file) => {
    const modelDef = require(path.join(__dirname, file));
    const model = modelDef(sequelize, DataTypes);
    db[model.name] = model;
  });

// Wire up associations declared on each model (see associate() below)
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.testConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info("MySQL database connected successfully (Sequelize)");
  } catch (err) {
    logger.error(`MySQL connection failed: ${err.message}`);
    process.exit(1);
  }
};

module.exports = db;