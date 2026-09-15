"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("user_settings", "phone", { type: Sequelize.STRING(30), allowNull: true });
    await queryInterface.addColumn("user_settings", "company", { type: Sequelize.STRING(150), allowNull: true });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn("user_settings", "company");
    await queryInterface.removeColumn("user_settings", "phone");
  },
};
