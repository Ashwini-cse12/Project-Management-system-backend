module.exports = (sequelize, DataTypes) => {
  const Project = sequelize.define(
    "Project",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      organization_id: { type: DataTypes.INTEGER, allowNull: false },
      name: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("Not Started", "In Progress", "Completed"),
        allowNull: false,
        defaultValue: "Not Started",
      },
      start_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      end_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
    },
    {
      tableName: "projects",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false,
    }
  );

  Project.associate = (models) => {
    Project.belongsTo(models.User, { foreignKey: "user_id" });
    Project.belongsTo(models.Organization, { foreignKey: "organization_id" });
    Project.hasMany(models.Task, { foreignKey: "project_id", onDelete: "CASCADE" });
  };

  return Project;
};
