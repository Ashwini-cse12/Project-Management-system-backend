const { Project, Task } = require("../models");
const { getAccessibleOrganizationIds } = require("./projectController");
const { asyncHandler } = require("../middleware/errorHandler");

// GET /api/dashboard
// All counts are scoped to req.user.id - every user only ever sees
// stats derived from their own projects/tasks.
const getDashboardStats = asyncHandler(async (req, res) => {
  const organizationIds = await getAccessibleOrganizationIds(req.user.id);
  const projectWhere = { organization_id: organizationIds };
  const projectIds = (await Project.findAll({ where: projectWhere, attributes: ["id"] })).map((project) => project.id);
  const taskWhere = { project_id: projectIds };

  const [totalProjects, projectsInProgress, totalTasks, completedTasks, pendingTasks, tasksInProgress] = await Promise.all([
    Project.count({ where: projectWhere }),
    Project.count({ where: { ...projectWhere, status: "In Progress" } }),
    Task.count({ where: taskWhere }),
    Task.count({ where: { ...taskWhere, status: "Completed" } }),
    Task.count({ where: { ...taskWhere, status: "Pending" } }),
    Task.count({ where: { ...taskWhere, status: "In Progress" } }),
  ]);

  res.status(200).json({
    success: true,
    data: {
      total_projects: totalProjects,
      total_tasks: totalTasks,
      completed_tasks: completedTasks,
      pending_tasks: pendingTasks,
      projects_in_progress: projectsInProgress,
      tasks_in_progress: tasksInProgress,
    },
  });
});

module.exports = { getDashboardStats };
