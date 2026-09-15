module.exports = (sequelize, DataTypes) => {
  const TokenBlacklist = sequelize.define(
    "TokenBlacklist",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      token: {
        type: DataTypes.STRING(512),
        allowNull: false,
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      tableName: "token_blacklist",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false,
    }
  );

  return TokenBlacklist;
};