const { Organization, OrganizationMember } = require("../models");
const { asyncHandler, ApiError } = require("../middleware/errorHandler");

const slugify = (value) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 140) || "organization";

const listOrganizations = asyncHandler(async (req, res) => {
  const organizations = await Organization.findAll({
    include: [{ model: OrganizationMember, as: "memberships", where: { user_id: req.user.id }, attributes: ["role"] }],
    order: [["name", "ASC"]],
  });
  res.json({ success: true, data: organizations });
});

const createOrganization = asyncHandler(async (req, res) => {
  const name = req.body.name.trim();
  const baseSlug = slugify(req.body.slug || name);
  let slug = baseSlug;
  let suffix = 2;
  while (await Organization.findOne({ where: { slug } })) slug = `${baseSlug}-${suffix++}`;
  const organization = await Organization.create({ name, slug, created_by: req.user.id });
  await OrganizationMember.create({ organization_id: organization.id, user_id: req.user.id, role: "Owner" });
  res.status(201).json({ success: true, message: "Organization created", data: organization });
});

const requireOrganizationMember = async (organizationId, userId) => {
  const membership = await OrganizationMember.findOne({ where: { organization_id: organizationId, user_id: userId } });
  if (!membership) throw new ApiError(404, "Organization not found");
  return membership;
};

module.exports = { listOrganizations, createOrganization, requireOrganizationMember };
