"use strict";

/** Adds organization tenancy and safely moves existing private projects into personal workspaces. */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("organizations", {
      id: { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING(150), allowNull: false },
      slug: { type: Sequelize.STRING(160), allowNull: false, unique: true },
      created_by: { type: Sequelize.INTEGER, allowNull: false, references: { model: "users", key: "id" }, onUpdate: "CASCADE", onDelete: "CASCADE" },
      created_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.createTable("organization_members", {
      organization_id: { type: Sequelize.INTEGER, allowNull: false, primaryKey: true, references: { model: "organizations", key: "id" }, onUpdate: "CASCADE", onDelete: "CASCADE" },
      user_id: { type: Sequelize.INTEGER, allowNull: false, primaryKey: true, references: { model: "users", key: "id" }, onUpdate: "CASCADE", onDelete: "CASCADE" },
      role: { type: Sequelize.ENUM("Owner", "Member"), allowNull: false, defaultValue: "Member" },
      created_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addColumn("projects", "organization_id", { type: Sequelize.INTEGER, allowNull: true, references: { model: "organizations", key: "id" }, onUpdate: "CASCADE", onDelete: "CASCADE" });
    await queryInterface.sequelize.query("INSERT INTO organizations (name, slug, created_by, created_at) SELECT CONCAT('Personal workspace ', id), CONCAT('personal-', id), id, NOW() FROM users");
    await queryInterface.sequelize.query("INSERT INTO organization_members (organization_id, user_id, role, created_at) SELECT id, created_by, 'Owner', NOW() FROM organizations");
    await queryInterface.sequelize.query("UPDATE projects p INNER JOIN organizations o ON o.created_by = p.user_id SET p.organization_id = o.id WHERE p.organization_id IS NULL");
    await queryInterface.changeColumn("projects", "organization_id", { type: Sequelize.INTEGER, allowNull: false, references: { model: "organizations", key: "id" }, onUpdate: "CASCADE", onDelete: "CASCADE" });
    await queryInterface.addIndex("projects", ["organization_id"]);
    await queryInterface.addIndex("organization_members", ["user_id"]);
  },
  async down(queryInterface) {
    await queryInterface.removeColumn("projects", "organization_id");
    await queryInterface.dropTable("organization_members");
    await queryInterface.dropTable("organizations");
  },
};
