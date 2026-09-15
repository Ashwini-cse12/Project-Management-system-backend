const { param } = require("express-validator");

const idParamValidator = [
  param("id").isInt({ min: 1 }).withMessage("id must be a positive integer"),
];

module.exports = { idParamValidator };