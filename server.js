require("dotenv").config();
const app = require("./app");
const { testConnection } = require("./models");
const logger = require("./utils/logger");

const PORT = process.env.PORT || 5000;

const start = async () => {
  await testConnection();
  app.listen(PORT, () => {
    logger.info(`Server running on http://localhost:${PORT}`);
  });
};
process.on("uncaughtException", err => {
  console.error("Uncaught Exception:", err);
});
process.on("unhandledRejection", err => {
  console.error("Unhandled Rejection:", err);
});

start();