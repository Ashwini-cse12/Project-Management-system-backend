const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { idParamValidator } = require("../validators/commonValidators");
const { createProjectValidator, updateProjectValidator } = require("../validators/projectValidators");
const {
  listProjects,
  getProjectSummary,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} = require("../controllers/projectController");

// Every route below requires a valid, non-revoked JWT.
router.use(authMiddleware);

router.get("/", listProjects);
router.get("/summary", getProjectSummary);
router.get("/:id", idParamValidator, validate, getProject);
router.post("/", createProjectValidator, validate, createProject);
router.put("/:id", idParamValidator, updateProjectValidator, validate, updateProject);
router.delete("/:id", idParamValidator, validate, deleteProject);

module.exports = router;
