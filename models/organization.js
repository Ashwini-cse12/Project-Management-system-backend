module.exports = (sequelize, DataTypes) => {
  const Organization = sequelize.define("Organization", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(150), allowNull: false },
    slug: { type: DataTypes.STRING(160), allowNull: false, unique: true },
    created_by: { type: DataTypes.INTEGER, allowNull: false },
  }, { tableName: "organizations", timestamps: true, createdAt: "created_at", updatedAt: false });

  Organization.associate = (models) => {
    Organization.belongsTo(models.User, { foreignKey: "created_by", as: "creator" });
    // Keep a direct association as well as the many-to-many relation so
    // organization queries can safely include the requesting member/role.
    Organization.hasMany(models.OrganizationMember, { foreignKey: "organization_id", as: "memberships", onDelete: "CASCADE" });
    Organization.belongsToMany(models.User, { through: models.OrganizationMember, foreignKey: "organization_id", otherKey: "user_id", as: "members" });
    Organization.hasMany(models.Project, { foreignKey: "organization_id", onDelete: "CASCADE" });
  };
  return Organization;
};
