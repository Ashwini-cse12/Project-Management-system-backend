module.exports = (sequelize, DataTypes) => {
  const OrganizationMember = sequelize.define("OrganizationMember", {
    organization_id: { type: DataTypes.INTEGER, primaryKey: true },
    user_id: { type: DataTypes.INTEGER, primaryKey: true },
    role: { type: DataTypes.ENUM("Owner", "Member"), allowNull: false, defaultValue: "Member" },
  }, { tableName: "organization_members", timestamps: true, createdAt: "created_at", updatedAt: false });

  OrganizationMember.associate = (models) => {
    OrganizationMember.belongsTo(models.Organization, { foreignKey: "organization_id" });
    OrganizationMember.belongsTo(models.User, { foreignKey: "user_id" });
  };
  return OrganizationMember;
};
