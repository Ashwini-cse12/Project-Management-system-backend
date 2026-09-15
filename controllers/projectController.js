const { Op } = require("sequelize");
const { Project, Task, OrganizationMember } = require("../models");
const { asyncHandler, ApiError } = require("../middleware/errorHandler");
const logger = require("../utils/logger");

// Fetches a project but ONLY if it belongs to the requesting user.
// Returning 404 (not 403) for someone else's project avoids confirming
// to an attacker that a given project ID even exists.
const getAccessibleOrganizationIds = async (userId) => (await OrganizationMember.findAll({ where: { user_id: userId }, attributes: ["organization_id"] })).map((member) => member.organization_id);
const findOwnedProject = async (id, userId) => {
  const organizationIds = await getAccessibleOrganizationIds(userId);
  const project = await Project.findOne({ where: { id, organization_id: organizationIds } });
  if (!project) {
    throw new ApiError(404, "Project not found");
  }
  return project;
};

// GET /api/projects?search=&status=&page=&limit=
const listProjects = asyncHandler(async (req, res) => {
  const { search, status } = req.query;
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);

  const where = { organization_id: await getAccessibleOrganizationIds(req.user.id) };
  if (search) {
    where.name = { [Op.like]: `%${search}%` };
  }
  if (status) {
    where.status = status;
  }

  const { rows, count } = await Project.findAndCountAll({
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

// GET /api/projects/summary
// Totals are calculated server-side across every project the requesting user
// can access, rather than only the currently paginated project list.
const getProjectSummary = asyncHandler(async (req, res) => {
  const where = { organization_id: await getAccessibleOrganizationIds(req.user.id) };
  const [total, active, completed, notStarted] = await Promise.all([
    Project.count({ where }),
    Project.count({ where: { ...where, status: "In Progress" } }),
    Project.count({ where: { ...where, status: "Completed" } }),
    Project.count({ where: { ...where, status: "Not Started" } }),
  ]);
  res.json({ success: true, data: { total, active, completed, not_started: notStarted } });
});

// GET /api/projects/:id
const getProject = asyncHandler(async (req, res) => {
  const project = await findOwnedProject(req.params.id, req.user.id);
  res.status(200).json({ success: true, data: project });
});

// POST /api/projects
const createProject = asyncHandler(async (req, res) => {
  const { name, description, status, start_date, end_date, organization_id } = req.body;
  const organizationIds = await getAccessibleOrganizationIds(req.user.id);
  if (!organizationIds.includes(Number(organization_id))) throw new ApiError(404, "Organization not found");

  const project = await Project.create({
    user_id: req.user.id,
    organization_id,
    name,
    description: description || null,
    status: status || "Not Started",
    start_date: start_date || null,
    end_date: end_date || null,
  });

  logger.info(`Project created (id=${project.id}) by user ${req.user.id}`);
  res.status(201).json({ success: true, message: "Project created", data: project });
});

// PUT /api/projects/:id
const updateProject = asyncHandler(async (req, res) => {
  const project = await findOwnedProject(req.params.id, req.user.id);

  const { name, description, status, start_date, end_date } = req.body;

  // Cross-field date check against the FINAL merged values (covers the
  // case where only one of the two dates is sent in this request).
  const finalStart = start_date !== undefined ? start_date : project.start_date;
  const finalEnd = end_date !== undefined ? end_date : project.end_date;
  if (finalStart && finalEnd && new Date(finalEnd) < new Date(finalStart)) {
    throw new ApiError(400, "end_date cannot be before start_date");
  }

  if (name !== undefined) project.name = name;
  if (description !== undefined) project.description = description;
  if (status !== undefined) project.status = status;
  if (start_date !== undefined) project.start_date = start_date;
  if (end_date !== undefined) project.end_date = end_date;

  await project.save();

  res.status(200).json({ success: true, message: "Project updated", data: project });
});

// DELETE /api/projects/:id
const deleteProject = asyncHandler(async (req, res) => {
  const project = await findOwnedProject(req.params.id, req.user.id);

  // Tasks under this project are removed automatically via ON DELETE
  // CASCADE (see the tasks migration's foreign key), so no manual cleanup
  // of Task rows is needed here.
  await project.destroy();

  logger.info(`Project deleted (id=${project.id}) by user ${req.user.id}`);
  res.status(200).json({ success: true, message: "Project deleted" });
});

module.exports = { listProjects, getProjectSummary, getProject, createProject, updateProject, deleteProject, findOwnedProject, getAccessibleOrganizationIds };
