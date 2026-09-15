const { body } = require("express-validator");

const strongPassword = body("password")
  .isLength({ min: 8 })
  .withMessage("Password must be at least 8 characters long")
  .matches(/[a-z]/)
  .withMessage("Password must include a lowercase letter")
  .matches(/[A-Z]/)
  .withMessage("Password must include an uppercase letter")
  .matches(/\d/)
  .withMessage("Password must include a number")
  .matches(/[^A-Za-z0-9]/)
  .withMessage("Password must include a symbol");

const registerValidator = [
  body("full_name")
    .trim()
    .notEmpty()
    .withMessage("Full name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Full name must be between 2 and 100 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Must be a valid email address")
    .normalizeEmail(),

  strongPassword,
];

const loginValidator = [
  body("email").trim().notEmpty().withMessage("Email is required").isEmail().withMessage("Must be a valid email address").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

const changePasswordValidator = [
  body("current_password").notEmpty().withMessage("Current password is required"),
  body("new_password")
    .isLength({ min: 8 }).withMessage("New password must be at least 8 characters long")
    .matches(/[a-z]/).withMessage("New password must include a lowercase letter")
    .matches(/[A-Z]/).withMessage("New password must include an uppercase letter")
    .matches(/\d/).withMessage("New password must include a number")
    .matches(/[^A-Za-z0-9]/).withMessage("New password must include a symbol"),
];

const profileValidator = [
  body("full_name").trim().notEmpty().withMessage("Full name is required").isLength({ max: 100 }).withMessage("Full name must be 100 characters or fewer"),
  body("phone").optional({ checkFalsy: true }).trim().isLength({ max: 30 }).withMessage("Phone number must be 30 characters or fewer"),
  body("company").optional({ checkFalsy: true }).trim().isLength({ max: 150 }).withMessage("Company must be 150 characters or fewer"),
  body("avatar_url").optional({ nullable: true }).isString().withMessage("Avatar must be an image"),
];

module.exports = { registerValidator, loginValidator, changePasswordValidator, profileValidator };
