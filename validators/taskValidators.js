const { body } = require("express-validator");

const PRIORITY_VALUES = ["Low", "Medium", "High"];
const STATUS_VALUES = ["Pending", "In Progress", "Completed"];

const createTaskValidator = [
  body("project_id").notEmpty().withMessage("project_id is required").isInt({ min: 1 }).withMessage("project_id must be a positive integer"),

  body("task_name")
    .trim()
    .notEmpty()
    .withMessage("Task name is required")
    .isLength({ max: 150 })
    .withMessage("Task name must be at most 150 characters"),

  body("description").optional({ nullable: true }).isString(),

  body("priority")
    .optional()
    .isIn(PRIORITY_VALUES)
    .withMessage(`priority must be one of: ${PRIORITY_VALUES.join(", ")}`),

  body("status")
    .optional()
    .isIn(STATUS_VALUES)
    .withMessage(`status must be one of: ${STATUS_VALUES.join(", ")}`),

  body("due_date").optional({ nullable: true }).isISO8601().withMessage("due_date must be a valid date (YYYY-MM-DD)"),
];

// project_id is intentionally NOT updatable here - moving a task to a
// different project is out of scope for this spec and reopens ownership
// questions that don't need to exist.
const updateTaskValidator = [
  body("task_name").optional().trim().notEmpty().withMessage("Task name cannot be empty").isLength({ max: 150 }),
  body("description").optional({ nullable: true }).isString(),
  body("priority").optional().isIn(PRIORITY_VALUES).withMessage(`priority must be one of: ${PRIORITY_VALUES.join(", ")}`),
  body("status").optional().isIn(STATUS_VALUES).withMessage(`status must be one of: ${STATUS_VALUES.join(", ")}`),
  body("due_date").optional({ nullable: true }).isISO8601().withMessage("due_date must be a valid date (YYYY-MM-DD)"),
];

module.exports = { createTaskValidator, updateTaskValidator, PRIORITY_VALUES, STATUS_VALUES };