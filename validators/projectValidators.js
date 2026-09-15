const { body } = require("express-validator");

const STATUS_VALUES = ["Not Started", "In Progress", "Completed"];

// Shared date-order check: if both dates are present, end must not be before start.
const validateDateOrder = (value, { req }) => {
  const { start_date, end_date } = req.body;
  if (start_date && end_date && new Date(end_date) < new Date(start_date)) {
    throw new Error("end_date cannot be before start_date");
  }
  return true;
};

const validateStartDate = (value) => {
  if (value && value < new Date().toISOString().slice(0, 10)) {
    throw new Error("start_date cannot be in the past");
  }
  return true;
};

const createProjectValidator = [
  body("organization_id").isInt({ min: 1 }).withMessage("organization_id is required"),
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Project name is required")
    .isLength({ max: 150 })
    .withMessage("Project name must be at most 150 characters"),

  body("description").optional({ nullable: true }).isString(),

  body("status")
    .optional()
    .isIn(STATUS_VALUES)
    .withMessage(`status must be one of: ${STATUS_VALUES.join(", ")}`),

  body("start_date").optional({ nullable: true }).isISO8601().withMessage("start_date must be a valid date (YYYY-MM-DD)").custom(validateStartDate),

  body("end_date")
    .optional({ nullable: true })
    .isISO8601()
    .withMessage("end_date must be a valid date (YYYY-MM-DD)")
    .custom(validateDateOrder),
];

// Same rules, but every field is optional since this is a partial update (PUT
// still allows updating a subset of fields here for a smoother UI experience).
const updateProjectValidator = [
  body("name").optional().trim().notEmpty().withMessage("Project name cannot be empty").isLength({ max: 150 }),
  body("description").optional({ nullable: true }).isString(),
  body("status").optional().isIn(STATUS_VALUES).withMessage(`status must be one of: ${STATUS_VALUES.join(", ")}`),
  body("start_date").optional({ nullable: true }).isISO8601().withMessage("start_date must be a valid date (YYYY-MM-DD)").custom(validateStartDate),
  body("end_date")
    .optional({ nullable: true })
    .isISO8601()
    .withMessage("end_date must be a valid date (YYYY-MM-DD)")
    .custom(validateDateOrder),
];

module.exports = { createProjectValidator, updateProjectValidator, STATUS_VALUES };
