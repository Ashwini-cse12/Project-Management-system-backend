const express = require("express");
const { body } = require("express-validator");
const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { listOrganizations, createOrganization } = require("../controllers/organizationController");

const router = express.Router();
router.use(authMiddleware);
router.get("/", listOrganizations);
router.post("/", [body("name").trim().notEmpty().withMessage("Organization name is required").isLength({ max: 150 }), body("slug").optional().trim().isLength({ max: 160 })], validate, createOrganization);
module.exports = router;
