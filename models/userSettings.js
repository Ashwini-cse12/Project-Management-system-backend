module.exports = (sequelize, DataTypes) => {
  const UserSettings = sequelize.define(
    "UserSettings",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
      avatar_url: { type: DataTypes.TEXT("medium"), allowNull: true },
      phone: { type: DataTypes.STRING(30), allowNull: true },
      company: { type: DataTypes.STRING(150), allowNull: true },
    },
    { tableName: "user_settings", timestamps: true, createdAt: "created_at", updatedAt: "updated_at" }
  );
  UserSettings.associate = (models) => {
    UserSettings.belongsTo(models.User, { foreignKey: "user_id", onDelete: "CASCADE" });
  };
  return UserSettings;
};
