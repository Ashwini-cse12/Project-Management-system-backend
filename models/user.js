module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      full_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
    },
    {
      tableName: "users",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false, // spec only calls for created_at on users
    }
  );

  User.associate = (models) => {
    User.hasMany(models.Project, { foreignKey: "user_id", onDelete: "CASCADE" });
    User.hasMany(models.Task, { foreignKey: "user_id", onDelete: "CASCADE" });
    User.belongsToMany(models.Organization, { through: models.OrganizationMember, foreignKey: "user_id", otherKey: "organization_id", as: "organizations" });
    User.hasOne(models.UserSettings, { foreignKey: "user_id", onDelete: "CASCADE", as: "settings" });
  };

  return User;
};
