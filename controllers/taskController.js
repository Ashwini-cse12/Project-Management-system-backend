const { Op } = require("sequelize");
const { Task, Project } = require("../models");
const { findOwnedProject, getAccessibleOrganizationIds } = require("./projectController");
const { asyncHandler, ApiError } = require("../middleware/errorHandler");
const logger = require("../utils/logger");

// Fetches a task but ONLY if it belongs to the requesting user.
const findOwnedTask = async (id, userId) => {
  const accessibleProject = { project_id: (await Project.findAll({ where: { organization_id: await getAccessibleOrganizationIds(userId) }, attributes: ["id"] })).map((project) => project.id) };
  const task = await Task.findOne({ where: { id, ...accessibleProject } });
  if (!task) {
    throw new ApiError(404, "Task not found");
  }
  return task;
};

// GET /api/tasks?search=&status=&priority=&project_id=&page=&limit=
const listTasks = asyncHandler(async (req, res) => {
  const { search, status, priority, project_id } = req.query;
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);

  const accessibleProjects = (await Project.findAll({ where: { organization_id: await getAccessibleOrganizationIds(req.user.id) }, attributes: ["id"] })).map((project) => project.id);
  const where = { project_id: accessibleProjects };
  if (search) {
    where.task_name = { [Op.like]: `%${search}%` };
  }
  if (status) {
    where.status = status;
  }
  if (priority) {
    where.priority = priority;
  }
  if (project_id) {
    await findOwnedProject(project_id, req.user.id);
    where.project_id = project_id;
  }

  const { rows, count } = await Task.findAndCountAll({
    where,
    order: [["created_at", "DESC"]],
    limit,
    offset: (page - 1) * limit,
  });

  res.status(200).json({
    success: true,
    data: rows,
    meta: { total: count, page, limit, totalPages: Math.ceil(count / limit) },
  });
});

// GET /api/tasks/:id
const getTask = asyncHandler(async (req, res) => {
  const task = await findOwnedTask(req.params.id, req.user.id);
  res.status(200).json({ success: true, data: task });
});

// POST /api/tasks
const createTask = asyncHandler(async (req, res) => {
  const { project_id, task_name, description, priority, status, due_date } = req.body;

  // A task can only be created under a project the user actually owns -
  // this is what stops someone from attaching tasks to another user's project.
  await findOwnedProject(project_id, req.user.id);

  const task = await Task.create({
    project_id,
    user_id: req.user.id,
    task_name,
    description: description || null,
    priority: priority || "Medium",
    status: status || "Pending",
    due_date: due_date || null,
  });

  logger.info(`Task created (id=${task.id}) under project ${project_id} by user ${req.user.id}`);
  res.status(201).json({ success: true, message: "Task created", data: task });
});

// PUT /api/tasks/:id
const updateTask = asyncHandler(async (req, res) => {
  const task = await findOwnedTask(req.params.id, req.user.id);

  const { task_name, description, priority, status, due_date } = req.body;

  if (task_name !== undefined) task.task_name = task_name;
  if (description !== undefined) task.description = description;
  if (priority !== undefined) task.priority = priority;
  if (status !== undefined) task.status = status;
  if (due_date !== undefined) task.due_date = due_date;

  await task.save();

  res.status(200).json({ success: true, message: "Task updated", data: task });
});

// PATCH /api/tasks/:id/complete - convenience endpoint for the common
// "mark as completed" action called out explicitly in the spec.
const completeTask = asyncHandler(async (req, res) => {
  const task = await findOwnedTask(req.params.id, req.user.id);
  task.status = "Completed";
  await task.save();
  res.status(200).json({ success: true, message: "Task marked as completed", data: task });
});

// DELETE /api/tasks/:id
const deleteTask = asyncHandler(async (req, res) => {
  const task = await findOwnedTask(req.params.id, req.user.id);
  await task.destroy();

  logger.info(`Task deleted (id=${task.id}) by user ${req.user.id}`);
  res.status(200).json({ success: true, message: "Task deleted" });
});

module.exports = { listTasks, getTask, createTask, updateTask, completeTask, deleteTask };
