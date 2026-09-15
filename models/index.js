const fs = require("fs");
const path = require("path");
const { DataTypes } = require("sequelize");
const { sequelize, Sequelize, testConnection } = require("../db");

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

db.testConnection = testConnection;

module.exports = db;
